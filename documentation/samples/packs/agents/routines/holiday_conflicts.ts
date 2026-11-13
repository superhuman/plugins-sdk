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
