import chalk from 'chalk';
import Client from '../network/Client.js';

type Options = {
    validateCert ?: boolean;
    iterations : number;
};

export const pingAction = async (authString : string, options : Options) : Promise<void> => {
    let client;

    try {
        client = await Client.fromAuthString(authString, options.validateCert);
    } catch (error) {
        console.error(chalk.red('Failed to connect'));
        console.error(error);
        process.exit(1);
    }

    console.log(`Testing with ${options.iterations} iterations…`);

    const start = performance.now();

    for (let i = 0; i < options.iterations; ++i) {
        await client.ping();
    }

    const end = performance.now();
    const averageTime = (end - start) / options.iterations;

    console.log(`Average ping time: ${averageTime}ms`);
    client.disconnect();
};
