import chalk from 'chalk';
import Client from '../network/Client.js';

type Options = {
    validateCert ?: boolean;
};

export const authAction = async (authString : string, options : Options) : Promise<void> => {
    let client;

    try {
        client = await Client.fromAuthString(authString, options.validateCert);
    } catch (error) {
        console.error(chalk.red('Failed to connect'));
        console.error(error);
        process.exit(1);
    }

    client.disconnect();
    console.log(chalk.green('Successfully authenticated'));
};
