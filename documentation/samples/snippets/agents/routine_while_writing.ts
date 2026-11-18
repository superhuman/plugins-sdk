import * as sdk from "@superhuman/plugins-sdk";

const agent = sdk.newAgent();

// BEGIN

agent.addDefaultRoutine({
  name: "${1:Routine name}",
  trigger: {
    kind: sdk.DefaultTriggerKind.WhileWriting,
    condition: "${2:The writing this routine should react to.}",
  },
  instructions: `
    $3$Instructions for the routine.$
  `,
});
