import type {TLSSocket} from 'tls';
import {connect} from 'tls';
import BufferedStream from './BufferedStream.js';

const authStringRegex = /^([^:]+):([^@]+)@([^:]+):(\d+)$/;

type BloopResult = 'unregistered' | 'throttled' | Buffer[];

class Client {
    public constructor(private readonly stream : BufferedStream<TLSSocket>) {
    }

    public static async fromAuthString(authString : string, validateCert ?: boolean) : Promise<Client> {
        const parseResult = authStringRegex.exec(authString);

        if (!parseResult) {
            throw new Error('Invalid auth string, must be in the format clientId:clientSecret@host:port');
        }

        const [, clientId, clientSecret, host, port] = parseResult;

        const socket = await new Promise<TLSSocket>((resolve, reject) => {
            const socket = connect({port: parseInt(port, 10), host, rejectUnauthorized: validateCert ?? false}, () => {
                resolve(socket);
            });

            socket.on('error', error => {
                reject(error);
            });
        });

        const stream = new BufferedStream(socket);
        stream.writeUint8(clientId.length);
        stream.writeAll(Buffer.from(clientId, 'ascii'));
        stream.writeUint8(clientSecret.length);
        stream.writeAll(Buffer.from(clientSecret, 'ascii'));
        stream.writeUint8(4);
        stream.writeAll(Buffer.from([192, 168, 0, 1]));

        const result = await stream.readUint8();

        if (result !== 0x01) {
            throw new Error('Invalid credentials');
        }

        return new Client(stream);
    }

    public async bloop(uid : Buffer) : Promise<BloopResult> {
        this.stream.writeUint8(0x00);
        this.stream.writeAll(uid);

        const result = await this.stream.readUint8();

        if (result === 0x00) {
            return 'unregistered';
        }

        if (result === 0x02) {
            return 'throttled';
        }

        const numAchievements = await this.stream.readUint8();
        const achievements = [];

        for (let i = 0; i < numAchievements; ++i) {
            achievements.push(await this.stream.readExact(16));
        }

        return achievements;
    }

    public async ping() : Promise<void> {
        this.stream.writeUint8(0x02);
        await this.stream.readUint8();
    }

    public disconnect() : void {
        this.stream.writeUint8(0x03);
        this.stream.close();
    }
}

export default Client;
