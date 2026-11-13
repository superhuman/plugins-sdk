import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Returns the infamous YouTube video by Rick Astley as an embed.
connector.addFormula({
  name: "Rickroll",
  description: "Embeds the video \"Never Gonna Give You Up\".",
  parameters: [],
  resultType: sdk.ValueType.String,
  codaType: sdk.ValueHintType.Embed,
  execute: async function ([], context) {
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  },
});
