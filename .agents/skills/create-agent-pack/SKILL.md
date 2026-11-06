---
name: create-agent-pack
description: Create or update a Superhuman Go agent plugin using sdk.newAgent(), including its instructions, tools, routines, triggers, validation, upload, and installation. Use when authoring an agent plugin or changing its routines or triggers; use plugin-scaffold for connector plugins built with sdk.newConnector().
---

# Create an agent plugin

Build a minimal agent plugin with the Plugins SDK (`sdk.newAgent()`). Complete local
authoring after validation succeeds, or report the specific blocker. Create a server
listing, upload, install, or run the agent remotely only when the user requests those
operations. Release only on an explicit release request. Full SDK docs: https://docs.superhuman.com/packs/build/latest.

For connector plugins that supply formulas or sync tables, use
[plugin-scaffold](../plugin-scaffold/SKILL.md) and
[plugin-tools](../plugin-tools/SKILL.md). This workflow is for `sdk.newAgent()`;
its existing `create-agent-pack` invocation name remains supported.

An agent plugin is defined almost entirely by three builder calls on `pack.ts`:

```typescript
import * as sdk from '@superhuman/plugins-sdk';

export const agent = sdk.newAgent();
agent.setInstructions('Print hello world.'); // the only required call
agent.setTools({docs: true}); // least privilege: uncomment more as needed
```

See `references/api.md` for the full `setTools` / routine / trigger signatures
(`addDefaultRoutine`, `setDefaultScheduleTrigger`, `setDefaultWhileWritingTrigger`,
event triggers) and how to look up a connector plugin's ID.

## Routines mental model

A **routine** is one named job on this agent: a label, optional per-run instructions,
and exactly one trigger (schedule, while-writing, or a plugin-declarable event). Prefer
`addDefaultRoutine` when the agent has more than one wake-up path, or when a wake-up
should do something different from the base `setInstructions` prompt. Use a plain
trigger setter (`setDefaultScheduleTrigger`, and so on) only when the trigger just
wakes the agent and the base instructions already cover that run.

| Do | Do not |
| --- | --- |
| One agent plugin, many jobs (daily brief, Slack keyword watch, while-writing assist) | Treat routines as multi-agent orchestration or handoff to another custom agent |
| Give every distinct job a short `name` | Leave several triggers unnamed when the user cares which job fired |
| Add `instructions` only when that job differs from the base prompt | Duplicate the whole system prompt into every routine |
| Share the agent's tools and connectors across routines | Expect a routine to grant a different connector set or call another agent as a tool |

Routines and plain default triggers share the same caps (one schedule; the same event
count limits). Docs maps `defaultRoutines` into the installed agent definition on
release, so named routines from the SDK do land for installers. Triggers and routine
metadata still copy at install time — reinstall (or a fresh plugin) after you change them.
Ask which jobs the agent should run, and whether each job's action differs from the base
prompt, before writing triggers.

## Work in your own directory

Work in a directory that isn't a checkout of this SDK's own repo — a real plugin author doesn't have this
repo checked out, they just install the **published** `@superhuman/plugins-sdk` package. This is what gives
you the `packs` CLI (`npx packs <cmd>`).

Each plugin lives in its own directory. The plugin ID (`.coda-pack.json`) is stored **per-directory**,
not globally — see "Two plugins, or a second install" below before reusing a directory for a second
plugin. The API token (`.coda.json`) is looked up from the current directory up through its parents,
so registering once in a parent folder covers every plugin beneath it. Keep that token file out of
version control.

## Pre-setup (once per machine)

```bash
# Node must be >= 22. If your shell defines node/npm as a lazy nvm loader, unset it first:
unset -f node npm npx pnpm corepack yarn 2>/dev/null
node --version   # confirm >= 22

mkdir <dir> && cd <dir>
npm install --save-dev @superhuman/plugins-sdk@latest
```

### Register an API token (once per directory)

```bash
npx packs login
```

Opens your account page to create a plugin-scoped API token, then prompts
you to paste it in and prints your identity to confirm. Have the user enter the
token in their own terminal. Keep it out of chat, source, and command arguments.
For a custom-domain account, use `--codaApiEndpoint https://your-org.coda.io`.

```bash
npx packs whoami
```

Confirms the token by printing your name and email. Because the token is found via parent folders,
you only repeat `login` when you start a directory tree outside the one you already registered.

## Steps

### 1. Write `pack.ts`

`npx packs init --agent --name "<name>"` scaffolds a `pack.ts` with `sdk.newAgent()`,
`setInstructions`, docs-only `setTools` presets, and a commented-out schedule trigger — no git or
template install needed. (Bare `npx packs init` scaffolds an empty connector plugin instead.)

Use `agent` as the definition export for the current SDK. To check an older installation, run `node -p "typeof require('@superhuman/plugins-sdk').newConnector"` from the plugin's directory. If it returns `undefined`, keep `sdk.newAgent()` but export the definition as `pack` and use `pack` for its builder calls.

Fill in `setInstructions` (required) and `setTools`
(everything left out of `setTools` is off). Prefer `addDefaultRoutine` for each named job
(see [Routines mental model](#routines-mental-model) and `references/api.md`); keep a plain
trigger setter only when the wake-up needs no separate name or per-run instructions. Ask
what the agent should actually do, which jobs should wake it, and which tools/connectors it
needs before writing this — don't guess a persona or connector IDs.

### 2. Validate (local, no token needed)

```bash
npx packs validate pack.ts
```

This is the first command that actually imports `pack.ts`, so a too-old SDK surfaces here as
`sdk.newAgent is not a function` (fix: `npm install @superhuman/plugins-sdk@latest`). Exit code 0 with no
output means it passed. Always run this after any edit, before uploading. Proceed when validation
exits 0.

### 3. Build (only for debugging bundling issues)

```bash
npx packs build pack.ts
```

Only bundles the TypeScript — does not execute `pack.ts`. A too-old SDK is **not** caught here.

### 4. Create the plugin (once per plugin)

```bash
npx packs create pack.ts --name "<name>" --description "<description>"
```

Mints a new plugin ID and stores it in `.coda-pack.json` for this directory. Run this **once per plugin** —
running it again in the same directory overwrites that mapping (the old plugin keeps running, you just
lose its local tracking file). See "Two plugins, or a second install" below if you want a second,
independent plugin.

The plugin's page won't show your source yet at this point — that's expected, upload (step 5) hasn't
happened.

### 5. Upload a version (writes the agent definition)

```bash
npx packs upload pack.ts --notes "<what changed>"
```

Every upload **creates a new version** (1, 2, 3, ... auto-assigned) — it never overwrites a prior
version. Because this is an agent plugin, upload is what actually writes/updates the agent
definition. Re-run this after every `pack.ts` edit (new tools, new instructions, new trigger, etc.) —
there is no separate "save" step. Proceed when upload succeeds and reports the new version.

### 5b. Check from the terminal (no browser)

```bash
npx packs validate pack.ts   # single pre-upload check: schema, instructions, triggers, connector warnings
npx packs agent install pack.ts   # binds the latest upload
npx packs agent chat pack.ts "what can you do?"   # remote run
```

Run `validate` after any edit, before uploading. For agent plugins it also warns about
connector plugin IDs that don't resolve (when you're logged in; pass `--no-checkConnectors`
to skip). Run `agent install` after uploading. It prints the agent instance id, the
tenant id, and the settings URL (`https://go.superhuman.com/builder/<agentInstanceId>`
on the default API host). Open that page to connect connectors. Run `agent chat` after
that. Chat looks up the install for this plugin and polls until
the reply lands (or `--timeout` expires). Pass `--agentInstanceId` or `--tenantId` only to
override. The command checks the instance belongs to this plugin.

Consecutive prompts share one thread. Chat saves the chat id in `~/.coda-agent-chats.json`
(per user, per plugin directory, never committed) and sends it on the next prompt, so a follow-up sees earlier turns. Chat prints which chat it continues and when it was last used. A chat idle for more than a day is not continued by default: chat starts a new one and prints the old id. Pass `--new` to
start a fresh thread, or `--chatId <id>` to continue a specific chat (its agent runs unless you
also pass `--agentInstanceId`). A chat id that is missing, not yours, or on another agent fails
with "That chat is gone"; run again with `--new`.

### 6. Set the listing name/description (UI)

Open `https://coda.io/p/<packId>?section=listing` to set/confirm the agent's name and description —
these are listing fields, not part of `pack.ts`.

### 7. Install and run (UI)

Open the agent directory (https://go.superhuman.com/agent-directory), search for the agent by the name
set in step 4/6, click **Open** → **install agent**. An uploaded-but-unreleased agent still runs for the
installer; a release (step 8) is only needed to make it broadly installable. Finish when the installed
agent runs the requested task and its tools/triggers match the definition. If account access or
installation is unavailable, report the blocked verification rather than claiming success.

### 8. (Optional) Release — make a version broadly installable

```bash
npx packs release pack.ts <version> --notes "<release notes>"
```

Needs `--notes` and a version greater than the latest release, plus a clean working tree if the plugin
directory is a git repo.

## Two plugins, or a second install

**Triggers, routines, and tool grants are copied at install time — they don't live-sync from later
uploads.** If you already installed an agent, then upload a new version that changes
`addDefaultRoutine`, `setDefaultScheduleTrigger` (or tools), the already-installed instance's
builder view won't reflect the change. To actually see a new routine/trigger/tool definition
rendered in the builder, either:

- Create a **fresh agent plugin in a new directory** (`cp pack.ts` into it, `npm install`, `login`,
  `create` with a new name, `upload`) and install _that_, so the very first install already carries the
  new definition, or
- Reinstall the existing agent after the new upload (if your product surface supports refreshing an
  install).

The new-directory route is simpler and is what this skill defaults to when verifying a trigger/tool
change actually shows up in the builder UI. See
[installation refresh](references/api.md#installation-refresh) for the full checklist.

## Testing recurrence rules

If you're testing a `setDefaultScheduleTrigger` rrule string, note that some RFC 5545 rule parts a
schedule trigger accepts — `BYSETPOS` (pick the Nth match from a `BYDAY` set), `WKST` (custom week
start), `COUNT` (bounded occurrences instead of `UNTIL`), ordinal `BYDAY` like `-1FR` ("last Friday") —
may not have a corresponding field in a simple recurrence-picker UI. Example:
`RRULE:FREQ=MONTHLY;BYDAY=-1FR;BYSETPOS=-1;BYMONTH=3;WKST=SU;COUNT=10`. Frequencies below hourly
(`MINUTELY`, `SECONDLY`) are rejected outright rather than being a "valid but unrepresentable" case —
see `references/api.md` for the full set of accepted/rejected rule parts, and
[schedule validation and UI limits](references/api.md#schedule-validation-and-ui-limits) when choosing
test cases.
