---
description: Coding-agent skills for building and contributing Superhuman plugins.
---

# Superhuman plugin

Coding-agent skills for building Superhuman agent plugins and connector plugins with `@superhuman/plugins-sdk`.
The bundle contains no MCP server and needs no credentials to install.

| Skill | Task |
| --- | --- |
| `create-agent-pack` | Create or update a Go agent plugin with `sdk.newAgent()`, including routines. |
| `plugin-scaffold` | Create a connector plugin and choose its domains and authentication. |
| `plugin-tools` | Add formulas, actions, indexed tables, and skills to a connector plugin. |
| `plugin-test-upload` | Execute, validate, upload, and test a connector plugin in Go. |

The maintained skills live together under `.agents/skills/`. The existing
`create-agent-pack` invocation and its API reference are reused here.

The SDK keeps `pack.ts` and the `packs` CLI. Connector plugins use
`sdk.newConnector()`; agent plugins use `sdk.newAgent()`. The skills include
factory or export fallbacks for older SDKs.

## Install from a checkout

Run these commands from the SDK repository root. In the product monorepo,
first change to `libs/packs-sdk`.

For Codex, copy the skills into your user skill directory. Review any existing
folders with the same names before replacing them.

```sh
mkdir -p ~/.codex/skills/superhuman-plugin
cp -R .agents/skills/. ~/.codex/skills/superhuman-plugin/
```

Start a new Codex session, then ask to use `$plugin-scaffold`, `$plugin-tools`,
or `$plugin-test-upload`. Use `$create-agent-pack` for an agent plugin built with `sdk.newAgent()`. Codex can also select a skill from its description.

For Cursor, copy the complete bundle as a real directory.

```sh
mkdir -p ~/.cursor/plugins/local/superhuman-plugin
cp -R .agents/. ~/.cursor/plugins/local/superhuman-plugin/
```

Reload Cursor and confirm the skills appear in Customize. Organization policy
may need to allow local plugin imports. See the
[Cursor installation guide](https://cursor.com/docs/plugins).

## Contribute

Edit the files in this directory and open a pull request to the SDK repository.
Follow [CONTRIBUTING.md](../CONTRIBUTING.md) for review and style rules.
Skills live outside the documentation site. Public skill changes require maintainer
reconciliation into the SDK source of truth before the next public snapshot;
the documentation import workflow does not currently accept this directory.

Keep descriptions specific enough to select the right skill. Use relative links
between skills. Keep each skill usable from an installed copy, without a local
SDK checkout. Link to maintained SDK documentation for detailed API behavior.
Do not include credentials or internal-only references.

Before opening a pull request, check that the manifest matches the
[Agent Plugins schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json),
that each skill's YAML name matches its directory, and that relative links
resolve. Install the edited copy in the agent you use and try a representative
request. Validate generated plugin code against the installed SDK. Upload and
release are separate operations and require the user's authorization.

## Distribution

`plugin.json` and `skills/` form a portable Agent Plugin bundle. Package this
directory as the bundle root, preserving the relative paths. The SDK license
applies to this directory and is included in `LICENSE.txt`.

For a release, review the bundle, increment its manifest version, and publish an
archive of this directory from a tagged SDK revision. Include `plugin.json`, `skills/`, `README.md`, and `LICENSE.txt` in the archive.
Publish installation instructions with the archive. A marketplace submission is a separate maintainer
step; this change does not create a listing or publish an archive.
