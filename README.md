# Bloop Server Tester

[![Release](https://github.com/bloop-box/bloop-server-tester/actions/workflows/release.yml/badge.svg)](https://github.com/bloop-box/bloop-server-tester/actions/workflows/release.yml)

Utility for testing bloop server implementations and performance.

## Installation

```bash
npm i -g bloop-server-tester
```

## Usage

To get a list of all commands and their arguments/options, run:

```bash
bloop-server-tester --help
```

By default, the tester will not validate server certificates. If you wish to do so, you can enable validation for any
command by supplying the `--validate-cert` option.

Each command uses an auth string to connect. An auth string is always in the following format:

```
<client-id>:<client-secret>@<host>:<port>
```

### Test authentication

Test authentication with a given client ID and secret:

```bash
bloop-server-tester auth <auth-string>
```

### Test ping reply time

Test the ping reply time of a server with a given number of iterations (defaults to 10):

```bash
bloop-server-tester ping -i 10 <auth-string>
```

### Load test server

You can continuously load test your server with a given number of connections and UIDs:

```bash
bloop-server-tester load-test -c 15 -u ababababababab acacacacacacac <auth-string>
```

This will send a bloop through every connection every 500ms.
