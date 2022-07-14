This project uses [npm audit](https://docs.npmjs.com/cli/audit) to scan dependencies for vulnerabilities
and automatically install any compatible updates to vulnerable dependencies.
The security audit is also integrated into the project's CI pipeline via [audit-ci](https://github.com/IBM/audit-ci) command
which fails the build if there is any vulnerability found.
It is possible to ignore specific errors by whitelisting them in [audit-ci config.](./audit-ci.json).

## NPM audit whitelist
Whenever you whitelist a specific advisory it is required to refer it to here and justify the whitelisting.

### Advisories

| #    | Level | Module | Title | Explanation |
|------|-------|---------|------|-------------|
| 1067342 | Low | babel-minify>yargs-parser | Prototype Pollution | dev dependency only |
| 1068310 | High | husky>find-versions>semver-regex | Prototype Pollution | dev dependency only |
| 1070458 | High | mocha>wide-align>string-width>strip-ansi>ansi-regex | Regular Expression Denial of Service | dev dependency only |
| 1081346 | moderate | eslint>table>string-width>strip-ansi>ansi-regex | Inefficient Regular Expression Complexity | dev dependency only |
| 1081346 | moderate | mocha>nanoid | Inefficient Regular Expression Complexity | dev dependency only |
| 1081481 | moderate | mocha>nanoid | Exposure of Sensitive Information to an Unauthorized Actor in nanoid | dev dependency only |
