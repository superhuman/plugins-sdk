# Agent builder API reference

These are the calls `sdk.newAgent()` returns for an agent. Connectors use the sync-table, formula, and `newConnector()` builder APIs.

Examples use the current SDK's `agent` export. If the agent skill selected the older-SDK `pack` export, use `pack` for these builder calls while keeping `sdk.newAgent()`.

## `setInstructions(instructions: string)`

The only required call. A plain string — the agent's system instructions.

```typescript
agent.setInstructions("You help a team run async standups. Keep replies short.");
```

## `setTools({docs, mail, webSearch, connectors})`

Anything left out is off — this call replaces the tool set each time, it doesn't merge with a prior
call.

```typescript
agent.setTools({
  docs: true,
  mail: true,
  webSearch: {allowedDomains: ['docs.example.com']},   // or just `true` for unrestricted
  connectors: [
    {connectorId: 1234, formulas: [{formulaName: 'CreateTask'}]},  // restrict to specific formulas
    {connectorId: 5678},                                            // or grant the whole connector
  ],
});
```

- `docs: true` → Coda/Superhuman Docs read+write access.
- `mail: true` → Mail & Calendar (Superhuman Mail) access.
- `webSearch: true | {allowedDomains: string[]}` → web search, optionally domain-restricted.
- `connectors: Array<{connectorId: number, formulas?: Array<{formulaName: string}>}>` → grants access to
  connectors (e.g. Slack) by connector ID, optionally narrowed to specific formulas. Set
  `connectorId`, not the deprecated `packId`; a connector takes one or the other, never both.

Use `connectorId` for the current SDK. To check an older installation, run `node -p "const a = require('@superhuman/plugins-sdk').newAgent(); a.setTools({connectors: [{connectorId: 1}]}); a.agent.tools[0].packId"` from the plugin's directory. If it prints `undefined`, the installed SDK predates `connectorId`: write `packId` in place of `connectorId` in every connector, or upgrade with `npm install @superhuman/plugins-sdk@latest`.

### Finding a connector's ID

Browse https://superhuman.com/store/connectors and open the connector's listing. The connector ID is the
number at the end of the listing URL: `https://superhuman.com/store/connectors/airtable-11262` is connector `11262`.

Use `setTools` above for access and `addDefaultRoutine` below for every wake-up path.

## `addDefaultRoutine({name?, instructions?, trigger})`

Adds one named job: a label and/or per-run instructions wrapped around a single trigger. Call it
once per job. A routine needs a non-blank `name` or `instructions` (or both). When the base
`setInstructions` already cover a wake-up, give the routine a short `name` and omit `instructions`.
Routines are still **one agent with many jobs** — they
do not hand work to another custom agent or grant a different tool set.

```typescript
agent.addDefaultRoutine({
  name: 'Daily brief',
  instructions: 'Summarize overnight changes. Include source links.',
  trigger: {
    kind: sdk.DefaultTriggerKind.Schedule,
    rruleString: [
      'DTSTART;TZID=America/New_York:20260101T090000',
      'RRULE:FREQ=DAILY;BYHOUR=9;BYMINUTE=0',
    ].join('\n'),
  },
});

agent.addDefaultRoutine({
  name: 'Deploy watch',
  instructions: 'Explain the deploy and link the runbook.',
  trigger: {
    kind: sdk.DefaultTriggerKind.Event,
    type: sdk.EventTriggerType.Slack,
    eventType: sdk.SlackEventType.MessageKeyword,
    keywords: ['deploy', 'rollback'],
  },
});

agent.addDefaultRoutine({
  name: 'Citation assist',
  instructions: 'Offer a citation when the user asserts a statistic.',
  trigger: {
    kind: sdk.DefaultTriggerKind.WhileWriting,
    condition: 'The draft asserts a statistic without a source',
    surfaces: [sdk.ContextualTriggerSurface.Docs, sdk.ContextualTriggerSurface.Email],
  },
});
```

- `name` — optional label in the agent builder (max 80 characters).
- `instructions` — optional text appended for that routine's run (max 20,000 characters). Omit when
  the base `setInstructions` already cover the job.
- `trigger` — one `DefaultTriggerDefinition`: schedule (`kind: Schedule` + `rruleString`; see
  [Schedule triggers](#schedule-triggers)), while-writing (`kind: WhileWriting` + `condition`, a
  natural-language string describing when to fire, and `surfaces`, an array of
  `sdk.ContextualTriggerSurface` values such as `Docs` or `Email`), or a plugin-declarable event
  (`kind: Event` + mail `message_received` / `message_sent` or Slack `message_keyword`). Docs
  events and Slack `agent_mentioned` are builder-only and are not plugin-declarable. Slack
  `keywords` is optional: omit it, or pass `[]`, to fire on every top-level message in the
  channels the installer binds.

An agent can have one schedule routine and one while-writing routine, and event routines share a count limit. Docs folds each
routine into the matching installed-agent default on release (name and instruction ride on that
trigger). Metadata still copies at install time — see [Installation refresh](#installation-refresh).

### Schedule triggers

`rruleString` is one `DTSTART` line (optional) plus one `RRULE` line, RFC 5545 style. The schedule
trigger accepts:

- `FREQ` must be `HOURLY`, `DAILY`, `WEEKLY`, `MONTHLY`, or `YEARLY` — `MINUTELY`/`SECONDLY` are
  rejected outright ("must not run more frequently than once per hour"), as is any combination of
  `BYHOUR`/`BYMINUTE` that packs two runs into the same hour.
- Supported rule parts: `FREQ`, `INTERVAL`, `COUNT`, `UNTIL`, `WKST`, `BYDAY` (optionally ordinal, e.g.
  `-1FR` for "last Friday", ranged ±1–53), `BYHOUR`, `BYMINUTE`, `BYMONTH`, `BYMONTHDAY` (±1–31),
  `BYSETPOS` (±1–366). Anything else (e.g. `BYSECOND`, `BYWEEKNO`) is rejected.
- `DTSTART` takes an optional `TZID` param (validated against Node's ICU timezone data) or a bare
  date/date-time; can't combine a `TZID` with a trailing `Z`.
- Several of these parts (`BYSETPOS`, `WKST`, `COUNT`, ordinal `BYDAY`) are validated as legal by the
  SDK but may not have a corresponding field in the builder's schedule-trigger form — see "Testing
  recurrence rules" in `SKILL.md`.

### Schedule validation and UI limits

Some accepted rule parts (`BYSETPOS`, `WKST`, `COUNT`, ordinal `BYDAY`) may have no
corresponding field in a simple recurrence-picker UI. Distinguish SDK validation from UI
representation when reporting results. For example:

```text
RRULE:FREQ=MONTHLY;BYDAY=-1FR;BYSETPOS=-1;BYMONTH=3;WKST=SU;COUNT=10
```

Use the accepted/rejected parts above when choosing test cases.

## Installation refresh

Triggers, routines, and tool grants are copied at install time; later uploads do not live-sync them.
To verify a changed definition in the builder, reinstall the agent if the product surface
supports refreshing an install. Otherwise create a fresh agent in a new directory and install it:

1. Copy `pack.ts` into the new directory and install the published SDK there.
2. Confirm credentials with `whoami`; register only if no parent credentials are available.
3. Validate, create with a distinct name, and upload using the main workflow.
4. Install the new agent and inspect its tools/triggers.

Creating a fresh agent is the default when installation refresh is unavailable.

## Build debugging

If the installed SDK predates 1.20.0, use `npx packs` for the command below.

```bash
npx plugins build pack.ts
```

Build only bundles TypeScript; it does not execute `pack.ts` or detect a missing `sdk.newAgent`.
Use it to diagnose bundling failures, then return to validation before uploading.

## Release

An uploaded-but-unreleased agent can run for its installer. Release a version only when
it should become broadly installable.

If the installed SDK predates 1.20.0, use `npx packs` for the release command.

```bash
npx plugins release pack.ts <version> --notes "<release notes>"
```

Choose an uploaded version greater than the latest release. If the plugin directory is a git
repository, use a clean working tree.

## Full working example

```typescript
import * as sdk from "@superhuman/plugins-sdk";

export const agent = sdk.newAgent();
agent.setInstructions(
  "You help an ops team stay on top of status and drafts. Keep replies short.",
);

agent.setTools({
  docs: true,
  mail: true,
  webSearch: {allowedDomains: ['status.example.com']},
  connectors: [{connectorId: 1000}, {connectorId: 1002}, {connectorId: 1004}],
});

agent.addDefaultRoutine({
  name: 'Monday brief',
  instructions: 'Summarize overnight status changes. Include source links.',
  trigger: {
    kind: sdk.DefaultTriggerKind.Schedule,
    rruleString: [
      "DTSTART;TZID=America/New_York:20260101T090000",
      "RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0",
    ].join("\n"),
  },
});

agent.addDefaultRoutine({
  name: 'Citation assist',
  instructions: 'Offer a citation when the draft asserts a statistic.',
  trigger: {
    kind: sdk.DefaultTriggerKind.WhileWriting,
    condition: "Offer a citation when the user asserts a statistic",
    surfaces: [sdk.ContextualTriggerSurface.Docs, sdk.ContextualTriggerSurface.Email],
  },
});
```
