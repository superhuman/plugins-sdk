import * as sdk from "@superhuman/plugins-sdk";

const agent = sdk.newAgent();

const $1$true$ = true;
const $2$true$ = true;
const $3$true$ = true;

// BEGIN

agent.setTools({
  docs: $1$true$,
  mail: $2$true$,
  webSearch: $3$true$,
  connectors: [
    // TODO: Add connectors here.
  ],
});
