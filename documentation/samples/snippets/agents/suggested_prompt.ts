import * as sdk from "@superhuman/plugins-sdk";

const agent = sdk.newAgent();

// BEGIN

// Add at most three suggested prompts.
agent.addSuggestedPrompt({
  name: "${1:MyPrompt}",
  displayName: "${2:My display name}",
  prompt: "${3:The prompt text.}",
});
