---
nav: Routines & triggers
description: Allow your agent to run automatically and provide proactive assistance.
cSpell:words: rrule TZID DTSTART RRULE
---

# Routines and triggers

Adding a routine to an agent allows it to run automatically in the background. Every routine has a trigger, which says when the routine runs. 

They can also include instructions, allowing you to customize the behavior of your agent when it is invoked by the trigger. The routine-specific instructions are provided to the LLM in addition to the agent-wide instructions provided in `setInstructions()`.

```ts
agent.addDefaultRoutine({
  name: "Package tracking",
  instructions: "Look up the tracking number and say where the package is.",
  trigger: {
    kind: sdk.DefaultTriggerKind.WhileWriting,
    condition: "Includes a package tracking number.",
  },
});
```

The sections below describe the types of triggers available.

!!! warning "Routines copied when the agent is installed"

    When a user installs your agent, the routines you've defined are copied to their agent instance. From there they can add, modify, or delete the routines. If in a later release you change a routine, those changes won't be pushed to existing installations.


## While writing

A while-writing trigger runs the agent as the user writes, in the same way Grammarly does. The agent can then show [screen annotations][screen_annotations] to provide context or suggest changes.

All while-writing triggers must include a `condition`, a natural-language description of the writing that should start a run. It's evaluated by a lightweight model, and exists separate from the other instructions in your agent. These triggers can also specify a list of `blockedDomains`, where it should never fire.

```ts
agent.addDefaultRoutine({
  name: "Package tracking",
  trigger: {
    kind: sdk.DefaultTriggerKind.WhileWriting,
    condition: "Includes a package tracking number.",
    blockedDomains: ["fedex.com", "ups.com"],
  },
});
```

!!! info "Only one while-writing routine"

    An agent can only have one routine with a while-writing trigger. If you have multiple use cases for that trigger type, you'll need to add them all to the same routine.

## Schedule

A schedule trigger runs the agent on a fixed schedule. It can be useful for regular, recurring tasks, like running reports or processing a queue.

The schedule is specified in the `rruleString` field, which expects a [RFC 5545][rfc5545] recurrence rule. It must include a `DTSTART` line, but the start date selected can be any datetime in the past.

```ts
agent.addDefaultRoutine({
  name: "Monday standup",
  trigger: {
    kind: sdk.DefaultTriggerKind.Schedule,
    rruleString: [
      // Every Monday at 9AM, local time.
      "RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0",
      "DTSTART:20260101T000000",
    ].join("\n"),
  },
});
```

A schedule can run at most hourly. `FREQ` will not accept `MINUTELY` or `SECONDLY`.

By default, the schedule's time will be relative to the timezone of the user that installed the agent. Add a `TZID` attribute to the `DTSTART` line to specify a specific timezone for calculating the schedule time.

```{.ts hl_lines="4"}
rruleString: [
  // Every Monday at 9AM, New York time.
  "RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0",
  "DTSTART;TZID=America/New_York:20260101T000000",
].join("\n"),
```

!!! info "Only one schedule routine"

    An agent can only have one routine with a schedule trigger. If you have multiple use cases for that trigger type, you'll need to add them all to the same routine.


## Event-based

An event-based trigger runs the agent when something happens in another application, such as a new email or a Slack message. It can be useful when the agent should pick up that activity, like drafting a reply or answering a question in a channel.

The `type` field says which product the event comes from, and the `eventType` field specifies which specific type of event in that product to watch for.

The trigger's `filters` provide a list of conditions the incoming event needs to meet. Each condition names a `field`, an `operator`, and a `value`, with product-specific enums for the fields.


### Mail

A mail trigger allows your agents to react to events in :superhuman-mail: Mail. In order to use a trigger of this type the user will need to be on a plan with access to the product and have it configured.

The following event types are supported:

- `MessageReceived` - The user receives an email.
- `MessageSent` - The user sends an email.

```ts
agent.addDefaultRoutine({
  name: "Log invoices",
  trigger: {
    kind: sdk.DefaultTriggerKind.Event,
    type: sdk.EventTriggerType.Mail,
    mailEventType: sdk.MailEventType.MessageReceived,
    filters: {
      conditions: [
        {
          field: sdk.MailFilterField.Subject,
          operator: sdk.FilterOperator.TextContains,
          value: "invoice",
        },
      ],
    },
  },
});
```

### Slack

A Slack trigger allows your agent to react to Slack messages and reply back. Some general settings are set in the Pack code, and when the user installs your agent they'll connect it to their Slack workspace and set additional settings.

The following event types are supported:

- `MessageKeyword` - A message is posted to a channel that includes one of the listed keywords.

!!! warning "Slack mention trigger not supported"

    The Agent Builder UI also supports an **Agent mentioned** trigger, that allows users to @-mention the agent in Slack. This trigger isn't yet available in the SDK.

```ts
agent.addDefaultRoutine({
  name: "Deploy watch",
  trigger: {
    kind: sdk.DefaultTriggerKind.Event,
    type: sdk.EventTriggerType.Slack,
    eventType: sdk.SlackEventType.MessageKeyword,
    keywords: ["deploy", "rollback"],
  },
});
```

An agent with this trigger gets its own identity in Slack, separate from the user that installed it. Additionally, when your agent is run with this trigger it has access to additional tools that allow it to:

- Read earlier messages in the thread
- Reply to the message
- Add a reaction

If the agent should only access Slack under its own identity, leave the Slack connector out of `setTools()`. That connector adds tools that act as the installing user, and offering both sets can confuse the model.


[screen_annotations]: screen-annotations.md
[rfc5545]: https://datatracker.ietf.org/doc/html/rfc5545
