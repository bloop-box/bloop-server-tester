import {readFile} from 'fs/promises';
import {InvalidArgumentError, program} from 'commander';
import updateNotifier from 'update-notifier';
import {authAction} from './action/auth.js';
import {bloopAction} from './action/bloop.js';
import {loadTestAction} from './action/load-test.js';
import {pingAction} from './action/ping.js';

type PackageJson = {
    name : string;
    version : string;
};

const packageJson = JSON.parse(await readFile(
    new URL('../package.json', import.meta.url),
    {encoding: 'utf-8'}
)) as PackageJson;

updateNotifier({pkg: packageJson}).notify();

const parseIntegerArgument = (value : string) : number => {
    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue)) {
        throw new InvalidArgumentError('Not a number.');
    }

    return parsedValue;
};

program
    .name('bloop-server-tester')
    .description('CLI tool for testing bloop servers')
    .version(packageJson.version)
    .option('-C, --validate-cert', 'validate server certificate');

program
    .command('auth')
    .description('test authentication')
    .argument('<auth-string>', 'authentication string')
    .action(authAction);

program
    .command('ping')
    .description('test ping reply time')
    .argument('<auth-string>', 'authentication string')
    .option('-i, --iterations <iterations>', 'number of iterations', parseIntegerArgument, 10)
    .action(pingAction);

program
    .command('bloop')
    .description('send a bloop to the server')
    .argument('<auth-string>', 'authentication string')
    .argument('<uuid>', 'UUID')
    .action(bloopAction);

program
    .command('load-test')
    .description('load test the server with bloops')
    .argument('<auth-string>', 'authentication string')
    .option('-c, --connections <connections>', 'Number of parallel connections', parseIntegerArgument, 1)
    .option('-u, --uuids <uuids...>', 'UUIDs to use for testing', ['ababababababab'])
    .action(loadTestAction);

await program.parseAsync();
