# Agent plugin builder API reference

These are the calls `sdk.newAgent()` returns for an agent plugin. Connector plugins use the sync-table, formula, and `newConnector()` builder APIs.

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
    {packId: 1234, formulas: [{formulaName: 'CreateTask'}]},  // restrict to specific formulas
    {packId: 5678},                                            // or grant the whole connector
  ],
});
```

- `docs: true` → Coda/Superhuman Docs read+write access.
- `mail: true` → Mail & Calendar (Superhuman Mail) access.
- `webSearch: true | {allowedDomains: string[]}` → web search, optionally domain-restricted.
- `connectors: Array<{packId: number, formulas?: Array<{formulaName: string}>}>` → grants access to
  connector plugins (e.g. Slack) by plugin ID, optionally narrowed to specific formulas.

### Finding a connector plugin's ID

Browse https://superhuman.com/store/connectors, open the connector's listing, and read its plugin ID off
the listing page.

Use `setTools` above, `addDefaultRoutine` for named jobs, and the plain trigger setters below when a
wake-up needs no separate name or per-run instructions.

## `addDefaultRoutine({name?, instructions?, trigger})`

Adds one named job: a label and/or per-run instructions wrapped around a single trigger. Call it
once per job. A routine needs a non-blank `name` or `instructions` (or both). Prefer this over a
plain trigger setter when the agent has more than one wake-up path, or when a wake-up should do
something different from `setInstructions`. Routines are still **one agent with many jobs** — they
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
- `trigger` — one `DefaultTriggerDefinition`: schedule (`kind: Schedule` + `rruleString`),
  while-writing (`kind: WhileWriting` + `condition` / `surfaces`), or a plugin-declarable event
  (`kind: Event` + mail `message_received` / `message_sent` or Slack `message_keyword`). Docs
  events and Slack `agent_mentioned` are builder-only and are not plugin-declarable.

Routines share the one-schedule and event-count caps with plain `defaultTriggers`. Docs folds each
routine into the matching installed-agent default on release (name and instruction ride on that
trigger). Metadata still copies at install time — see [Installation refresh](#installation-refresh).

## `setDefaultScheduleTrigger({rruleString})`

Use when the schedule only wakes the agent and the base instructions already cover that run. For a
named daily brief (or any schedule whose action differs from the base prompt), prefer
`addDefaultRoutine` with a schedule trigger instead.

```typescript
agent.setDefaultScheduleTrigger({
  rruleString: [
    "DTSTART;TZID=America/New_York:20260101T090000",
    "RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0",
  ].join("\n"),
});
```

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

## `setDefaultWhileWritingTrigger({condition, surfaces})`

Use when while-writing assistance should just wake the agent under the base instructions. Prefer
`addDefaultRoutine` when that assist needs its own name or per-run instructions.

```typescript
agent.setDefaultWhileWritingTrigger({
  condition: "Offer a citation when the user asserts a statistic",
  surfaces: [sdk.ContextualTriggerSurface.Docs, sdk.ContextualTriggerSurface.Email],
});
```

`condition` is a natural-language string describing when the trigger should fire. `surfaces` is an
array of `sdk.ContextualTriggerSurface` values (e.g. `Docs`, `Email`) naming where it's active.

## Installation refresh

Triggers, routines, and tool grants are copied at install time; later uploads do not live-sync them.
To verify a changed definition in the builder, reinstall the agent if the product surface
supports refreshing an install. Otherwise create a fresh agent plugin in a new directory and install it:

1. Copy `pack.ts` into the new directory and install the published SDK there.
2. Confirm credentials with `whoami`; register only if no parent credentials are available.
3. Validate, create with a distinct name, and upload using the main workflow.
4. Install the new agent and inspect its tools/triggers.

Creating a fresh agent plugin is the default when installation refresh is unavailable.

## Build debugging

```bash
npx packs build pack.ts
```

Build only bundles TypeScript; it does not execute `pack.ts` or detect a missing `sdk.newAgent`.
Use it to diagnose bundling failures, then return to validation before uploading.

## Release

An uploaded-but-unreleased agent can run for its installer. Release a version only when
it should become broadly installable:

```bash
npx packs release pack.ts <version> --notes "<release notes>"
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
  connectors: [{packId: 1000}, {packId: 1002}, {packId: 1004}],
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
