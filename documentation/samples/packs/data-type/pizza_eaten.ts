import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Formula that converts slices of a pizza into a percentage eaten.
connector.addFormula({
  name: "PizzaEaten",
  description: "Calculates what percentage of a pizza was eaten.",
  parameters: [
    sdk.makeParameter({
      type: sdk.ParameterType.Number,
      name: "slices",
      description: "How many slices were eaten.",
    }),
  ],
  resultType: sdk.ValueType.Number,
  codaType: sdk.ValueHintType.Percent,
  execute: async function ([slices], context) {
    return slices / 8;
  },
});
