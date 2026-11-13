import * as sdk from "@superhuman/plugins-sdk";

const connector = sdk.newConnector();

// BEGIN

connector.addColumnFormat({
  name: "${1:My Column Format}",
  instructions: "${2:My description.}",
  formulaName: "${3:MyFormula}",
  matchers: [
    // TODO: If formatting a URL, add a regular expression that matches it.
  ],
});
