import * as sdk from "@superhuman/plugins-sdk";

export const agent = sdk.newAgent();

agent.setInstructions("Use the Holidays connector. Don't invent holidays.");

agent.setTools({
  connectors: [
    // Holidays: https://superhuman.com/store/connectors/holidays-22009
    { connectorId: 22009 },
  ],
});

agent.addDefaultRoutine({
  name: "Holiday conflicts",
  trigger: {
    kind: sdk.DefaultTriggerKind.WhileWriting,
    condition: "Proposes a date.",
  },
  instructions: "If it's a public holiday, comment noting the conflict.",
});
