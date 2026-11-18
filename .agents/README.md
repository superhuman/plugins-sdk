---
description: Coding-agent skills for building Superhuman agents and connectors.
---

# Superhuman Plugins SDK for coding agents

Coding-agent skills for building Superhuman agents and connectors with `@superhuman/plugins-sdk`.
The bundle contains no MCP server and needs no credentials to install.

| Skill                   | Task                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| `create-agent`          | Create or update a Go agent with `sdk.newAgent()`, including routines. |
| `create-connector`      | Create a connector and choose its domains and authentication.          |
| `connector-tools`       | Add formulas, actions, and sync tables to a connector.                 |
| `connector-test-upload` | Execute, validate, upload, and test a connector in Go.                 |

The skills use the `plugins` CLI and support older SDK versions, which name it `packs`.

## Install

The copy commands below run from the SDK repository root. The marketplace command runs from anywhere.

For ChatGPT and Codex, add the SDK repository as a plugin marketplace. Its
marketplace file is `.agents/plugins/marketplace.json`.

```sh
codex plugin marketplace add superhuman/plugins-sdk
```

Restart the ChatGPT desktop app. Open the Plugins Directory, choose the
**Superhuman** marketplace, and install **Superhuman Plugins SDK**. To install
from the terminal instead, run `codex plugin add plugins-sdk@superhuman`. A
checkout of the SDK repository opened in Codex also shows this marketplace. The skills run
Node.js and the `plugins` CLI, so use them in a local thread.

To install only the skills in Codex, copy them into your user skill directory. Review any existing
folders with the same names before replacing them. If you followed an earlier version
of this guide, delete `~/.codex/skills/superhuman-plugin` to avoid loading the skills twice.

```sh
mkdir -p ~/.codex/skills/plugins-sdk
cp -R .agents/skills/. ~/.codex/skills/plugins-sdk/
```

Start a new Codex session, then ask to use `$create-connector`, `$connector-tools`,
or `$connector-test-upload`. Use `$create-agent` for an agent built with `sdk.newAgent()`. Codex can also select a skill from its description.

For Cursor, copy the complete bundle as a real directory. If you installed an
earlier version, delete `~/.cursor/plugins/local/superhuman-plugin` first so
the skills are not loaded twice.

```sh
mkdir -p ~/.cursor/plugins/local/plugins-sdk
cp -R .agents/. ~/.cursor/plugins/local/plugins-sdk/
```

Reload Cursor and confirm the skills appear in Customize. Organization policy
may need to allow local plugin imports. See the
[Cursor installation guide](https://cursor.com/docs/plugins).

## Contribute

Open a pull request to the SDK repository and follow
[CONTRIBUTING.md](../CONTRIBUTING.md). Maintainers carry accepted skill changes
into the SDK source of truth before the next public release.

Before you open it, check that:

- The `name:` line at the top of each `SKILL.md` matches its folder: `skills/create-agent/SKILL.md` starts with `name: create-agent`.
- Links between skills are relative, such as `../connector-test-upload/SKILL.md`, and each one opens a file that exists.
- A skill still works after it is copied alone into `~/.codex/skills/`. For API details it links to https://docs.superhuman.com/packs/build/latest, not to files in this repository.
- No skill contains an API token, a password, or a link to an internal Superhuman host.
- `plugin.json` validates against https://agent-plugins.org/schemas/1.0.0/plugin.schema.json.
