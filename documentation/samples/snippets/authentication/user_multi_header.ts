import * as sdk from "@superhuman/plugins-sdk";

const connector = sdk.newConnector();

// BEGIN

connector.setUserAuthentication({
  type: sdk.AuthenticationType.MultiHeaderToken,
  headers: [
    { name: "${1:X-My-Token}", description: "${2:My token description}" },
    { name: "${3:X-My-Key}", description: "${4:My key description}" },
    // TODO: Add more headers, if needed.
  ],
  instructionsUrl: "${5:https://help.example.com/api-tokens}",
  getConnectionName: async function (context) {
    // TODO: Fetch the name of the account.
    let name = "";
    return name;
  },
});
