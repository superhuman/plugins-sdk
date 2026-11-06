---
name: plugin-test-upload
description: Execute, validate, build, and upload a Superhuman connector plugin, or test it in Go. Use when checking plugin behavior or preparing a version. Release only on explicit request.
---

# Validate and upload a connector plugin

The SDK uses the `packs` CLI and a `pack.ts` entry point. Run `npx packs <command> --help` to check the installed version's arguments.

## Local checks

```sh
npx packs execute pack.ts ExchangeRate USD EUR
npx packs validate pack.ts
npx packs build pack.ts --outputDir dist
```

Replace the example formula and arguments with the plugin's actual tool. Sync tables can also be executed locally. Execution can make real network requests and actions can change external data, so choose a read operation or a disposable test account unless the user has authorized the write.

For authenticated execution, have the user run `npx packs auth pack.ts` and enter credentials at the prompt. Keep `.coda-credentials.json` out of version control. Do not read or print its contents. Local execution does not exercise Go's skill routing or indexing.

## Upload

Upload when the user requests it. Each upload creates a server version.

If registration is needed, have the user run `npx packs register` in their terminal and enter the token at the prompt. Do not accept tokens in chat or put them in command arguments. Keep `.coda.json` out of version control. Use `npx packs whoami` to check registration.

For a new listing, run `npx packs create pack.ts --help`, then create it with the user's chosen name and description. For an existing listing, use the installed CLI's link command. Validate successfully before uploading.

```sh
npx packs upload pack.ts --notes "Describe the change."
```

Only run `npx packs release` when the user explicitly asks to release. A release affects installed users. Upload authorization alone does not authorize release.

## Test in Go

Install the plugin from Go's plugin management UI, authenticate if needed, and ask a question that exercises its tools or indexed data. Inspect the plugin logs for the actual calls and returned errors. To try an unreleased upload, select the latest uploaded version in the plugin's settings if your account has access. A successful local run does not prove retrieval or routing in Go.

See the [CLI guide](https://docs.superhuman.com/packs/build/latest/guides/development/cli/) and [version guide](https://docs.superhuman.com/packs/build/latest/guides/development/versions/) for current upload, release, and version selection behavior.
