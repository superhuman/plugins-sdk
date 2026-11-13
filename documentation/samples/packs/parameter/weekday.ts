import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Formula that gets the current weekday, for example "Monday".
connector.addFormula({
  name: "CurrentWeekday",
  description: "Get the current day of the week.",
  parameters: [],
  resultType: sdk.ValueType.String,
  execute: async function ([], context) {
    let now = new Date();
    let formatter = Intl.DateTimeFormat("us-US", {
      timeZone: context.timezone,
      weekday: "long",
    });
    return formatter.format(now);
  },
});
