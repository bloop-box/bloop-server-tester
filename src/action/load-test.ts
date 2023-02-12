import chalk from 'chalk';
import Client from '../network/Client.js';

type Options = {
    validateCert : boolean;
    connections : number;
    uuids : string[];
};

export const loadTestAction = async (authString : string, options : Options) : Promise<void> => {
    const clients : Client[] = [];

    for (let i = 0; i < options.connections; ++i) {
        try {
            clients.push(await Client.fromAuthString(authString, options.validateCert));
        } catch (error) {
            console.error(chalk.red('Failed to connect'));
            console.error(error);
            process.exit(1);
        }
    }

    let uids : Buffer[];

    try {
        uids = options.uuids.map(uid => {
            return Buffer.from(uid, 'hex');
        });
    } catch {
        console.error(chalk.red('Some UUIDs were not valid hex encoded'));
        process.exit(1);
    }

    if (uids.some(uid => uid.length !== 7)) {
        console.error(chalk.red('Some UUIDs were not exactly 7 bytes long'));
        process.exit(1);
    }

    process.on('SIGINT', () => {
        clients.forEach(client => {
            client.disconnect();
        });

        process.exit(0);
    });

    console.log(`Running load test with ${options.connections} connections. Hit CTRL+C to cancel…`);

    let uidIndex = 0;

    const getNextUid = () => {
        const uid = uids[uidIndex];
        uidIndex = uidIndex === uids.length - 1 ? 0 : uidIndex + 1;
        return uid;
    };

    const sendBloops = async () => {
        const start = performance.now();
        const results = await Promise.all(clients.map(async client => await client.bloop(getNextUid())));
        const end = performance.now();
        const time = end - start;

        if (results.some(result => result === 'unregistered')) {
            console.error(chalk.red('Unregistered UID'));
            process.exit(1);
        }

        if (results.some(result => result === 'throttled')) {
            console.error(chalk.red('Ran into throttling'));
            process.exit(1);
        }

        const timingMessage = `Time for ${options.connections} bloops: ${time}ms`;
        console.info(time <= 500 ? chalk.blue(timingMessage) : chalk.yellow(timingMessage));

        setTimeout(() => {
            sendBloops().catch(error => {
                console.error(chalk.red('Failed to send bloop'));
                console.error(error);
                process.exit(1);
            });
        }, Math.max(0, 500 - time));
    };

    await sendBloops();
};
