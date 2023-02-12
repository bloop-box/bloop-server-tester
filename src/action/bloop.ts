import chalk from 'chalk';
import Client from '../network/Client.js';

type Options = {
    validateCert : boolean;
};

export const bloopAction = async (authString : string, uuid : string, options : Options) : Promise<void> => {
    let client;

    try {
        client = await Client.fromAuthString(authString, options.validateCert);
    } catch (error) {
        console.error(chalk.red('Failed to connect'));
        console.error(error);
        process.exit(1);
    }

    let binaryUuid;

    try {
        binaryUuid = Buffer.from(uuid, 'hex');
    } catch {
        console.error(chalk.red('UUID is not in hex format'));
        process.exit(1);
    }

    if (binaryUuid.length !== 7) {
        console.error(chalk.red('UUID is not 7 bytes long'));
        process.exit(1);
    }

    const result = await client.bloop(binaryUuid);
    client.disconnect();

    if (result === 'unregistered') {
        console.log(chalk.yellow('Unregistered UUID'));
        return;
    }

    if (result === 'throttled') {
        console.log(chalk.yellow('Throttled UUID'));
        return;
    }

    console.log(chalk.green('Valid UUID, achievements:'));

    if (result.length === 0) {
        console.log('No achievements');
        return;
    }

    result.forEach(achievementId => {
        console.log(`  - ${achievementId.toString('hex')}`);
    });
};
