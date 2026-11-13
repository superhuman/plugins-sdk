---
nav: Routines
description: Allow an agent to run automatically as the user works.
icon: material/repeat
---

# Routine examples

Routines let an agent run automatically without the user starting a chat. A routine's trigger determines when it runs, and can respond to writing, a schedule, or an event in another app.


[Learn More](../../features/triggers.md){ .md-button }

## While writing
A while-writing routine that comments when a proposed date falls on a holiday.

```ts
{% raw %}
import * as sdk from "@superhuman/plugins-sdk";

export const agent = sdk.newAgent();

agent.addDefaultRoutine({
  name: "Holiday conflicts",
  trigger: {
    kind: sdk.DefaultTriggerKind.WhileWriting,
    condition: `
      Proposes a specific date or date range for a meeting, event, deadline, or
      trip.
    `,
  },
  instructions: `
    Check each date or range the user proposes for a meeting, event, deadline,
    or trip.

    1. Resolve it to an exact date, including "next Friday" or "the 3rd",
       against today.
    2. Infer the region from a city, a company location, or the attendees'
       locations. If you can't tell, assume the United States and say so.
    3. Check public holidays on that date and the days just before and after.
    4. If one conflicts, comment with the holiday, the region, and the nearest
       clear date. Otherwise don't comment.

    Only comment. Don't edit the text, suggest new wording, flag ordinary
    weekends, or comment twice on the same date.
  `,
});

agent.setInstructions(`
  You help with dates and scheduling. Use the Holidays connector for public
  holidays. Don't invent holidays or dates.
`);

agent.setTools({
  connectors: [
    // Holidays: https://superhuman.com/store/connectors/holidays-22009
    { connectorId: 22009 },
  ],
});
{% endraw %}
```
## Schedule
A schedule routine that summarizes the past week from GitHub and Jira.

```ts
{% raw %}
import * as sdk from "@superhuman/plugins-sdk";

export const agent = sdk.newAgent();

agent.addDefaultRoutine({
  name: "Monday standup",
  // Monday at 9:00 AM, America/New_York.
  trigger: {
    kind: sdk.DefaultTriggerKind.Schedule,
    rruleString: [
      "DTSTART;TZID=America/New_York:20260105T090000",
      "RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0",
    ].join("\n"),
  },
  instructions: `
    Write a standup digest of the past 7 days that a reader can finish in under
    a minute.

    1. GitHub: pull requests the user opened, merged, or was asked to review.
       Note any with no activity for 3 or more days.
    2. Jira: issues assigned to the user that changed status, and anything due
       this week.

    One-line bullets, with a source link, in this order. Omit empty sections.

    - Shipped last week
    - In progress
    - Needs my attention
    - Coming up this week
  `,
});

agent.setInstructions(`
  You help an engineering team track their work in GitHub and Jira. Use the
  Atlassian connector for Jira. Keep replies short and scannable.

  Don't invent activity. Only report what the tools return. If a connector is
  unavailable or returns nothing, say so in one line rather than guessing.
`);

agent.setTools({
  connectors: [
    // GitHub: https://superhuman.com/store/connectors/github-1013
    { connectorId: 1013 },
    // Atlassian: https://superhuman.com/store/connectors/atlassian-53840
    { connectorId: 53840 },
  ],
});
{% endraw %}
```

