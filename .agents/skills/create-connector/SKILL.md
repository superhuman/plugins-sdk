---
name: create-connector
description: Create a Superhuman connector with the Plugins SDK, including network domains and authentication. Use when starting a connector or choosing its authentication.
---

# Create a Superhuman connector

Connectors supply formulas, actions, and sync tables to Superhuman Docs, and tools and indexed data to Superhuman Go. The SDK uses the `plugins` CLI and a `pack.ts` entry point.

For an agent built with `sdk.newAgent()`, read [create-agent](../create-agent/SKILL.md).

Use the Node version supported by the installed SDK. Check `node --version` and the SDK's `engines` field before installing dependencies.

1. In the user's target directory, initialize npm and install `@superhuman/plugins-sdk`.
2. From the plugin's directory, run `node -p "typeof require('@superhuman/plugins-sdk').newConnector"` to check the installed SDK. A `function` result selects the current SDK path; `undefined` selects the older-SDK fallback.
3. Run `npx plugins init --help` and use the scaffold command supported by that version. On the older-SDK fallback, run `npx packs` in place of `npx plugins` here and in every later command; those SDKs have no `plugins` CLI, and npm would fetch an unrelated package by that name. Preserve an existing project instead of overwriting it.
4. If `newConnector` is available, use `sdk.newConnector()` and export the definition as `connector`. Otherwise, use `sdk.newPack()`, export it as `pack`, and use `pack` for the builder calls.

```ts
import * as sdk from "@superhuman/plugins-sdk";

export const connector = sdk.newConnector();
connector.addNetworkDomain("example.com");
```

Declare every domain called through `context.fetcher.fetch()`. A root domain covers its subdomains. Most plugins should declare one service domain; build separate plugins for separate services. An approved sandbox domain for the same service is a common reason to declare multiple domains. Multiple domains require approval; consult the [fetcher guide](https://docs.superhuman.com/packs/build/latest/guides/basics/fetcher/) before adding them.

Choose per-user authentication when each user needs their own account. Choose system authentication when the plugin owner supplies a shared credential. Implement `getConnectionName` for per-user connections so users can identify their account. Follow the [authentication guide](https://docs.superhuman.com/packs/build/latest/guides/basics/authentication/) for the selected provider and credential type.

Keep `.coda.json`, `.coda-credentials.json`, `node_modules/`, and `_upload_build/` out of version control. Credentials belong in the CLI prompt or Plugin Studio settings. Never put secrets in source or chat.

For tools and data, read [connector-tools](../connector-tools/SKILL.md). Before completing a scaffold, follow the [local checks](../connector-test-upload/SKILL.md#local-checks) and require successful validation and build, or report the specific blocker. Upload only when the user requests it.
