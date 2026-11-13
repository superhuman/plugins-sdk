import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Say Hello to the given name.
connector.addFormula({
  name: "Hello",
  description: "A Hello World example.",
  parameters: [
    sdk.makeParameter({
      type: sdk.ParameterType.String,
      name: "name",
      description: "The person's name you would like to say hello to.",
    }),
  ],
  resultType: sdk.ValueType.String,
  execute: async function ([name]) {
    return "Hello " + name + "!";
  },
});
