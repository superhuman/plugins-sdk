import * as sdk from "@superhuman/plugins-sdk";

export const agent = sdk.newAgent();

agent.setInstructions("Use the Todoist connector. Don't invent tasks.");

agent.setTools({
  connectors: [
    // Todoist: https://superhuman.com/store/connectors/todoist-48345
    { connectorId: 48345 },
  ],
});

agent.addDefaultRoutine({
  name: "Slack action items",
  trigger: {
    kind: sdk.DefaultTriggerKind.Event,
    type: sdk.EventTriggerType.Slack,
    eventType: sdk.SlackEventType.MessageKeyword,
    keywords: ["action item"],
  },
  instructions: `
    Create a Todoist task for the action item. Reply with the name and link.
    Links use the format https://app.todoist.com/app/task/<id>.
  `,
});
