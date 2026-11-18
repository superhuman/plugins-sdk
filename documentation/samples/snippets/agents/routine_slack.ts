import * as sdk from "@superhuman/plugins-sdk";

const agent = sdk.newAgent();

// BEGIN

agent.addDefaultRoutine({
  name: "${1:Routine name}",
  trigger: {
    kind: sdk.DefaultTriggerKind.Event,
    type: sdk.EventTriggerType.Slack,
    eventType: sdk.SlackEventType.MessageKeyword,
    keywords: [
      // TODO: Add keywords here.
    ],
  },
  instructions: `
    $3$Instructions for the routine.$
  `,
});
