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
