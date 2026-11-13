---
name: packs-sdk-hub
description: Packs SDK work in libs/packs-sdk. Indexes its skills.
---

## Skills

- `libs/packs-sdk/.agents/skills/create-agent-pack` — Create or update a Superhuman Go agent using sdk.newAgent(), including its instructions, tools, routines, triggers, validation, upload, and installation. Use when authoring an agent or changing its routines or triggers; use plugin-scaffold for connector plugins built with sdk.newPack().
- `libs/packs-sdk/.agents/skills/plugin-scaffold` — Create a Superhuman plugin with the Plugins SDK, including network domains and authentication. Use when starting a connector plugin or choosing its authentication.
- `libs/packs-sdk/.agents/skills/plugin-test-upload` — Execute, validate, build, and upload a Superhuman plugin, or test it in Go. Use when checking plugin behavior or preparing a version. Release only on explicit request.
- `libs/packs-sdk/.agents/skills/plugin-tools` — Add formulas, actions, indexed sync tables, or skills to a Superhuman plugin. Use when editing these capabilities or improving tool discovery and data retrieval in an existing plugin.
