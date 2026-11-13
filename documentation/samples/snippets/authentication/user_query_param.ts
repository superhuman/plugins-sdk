import * as sdk from "@superhuman/plugins-sdk";

const connector = sdk.newConnector();

// BEGIN

connector.setUserAuthentication({
  type: sdk.AuthenticationType.QueryParamToken,
  paramName: "${1:myToken}",
  instructionsUrl: "${2:https://help.example.com/api-tokens}",
  getConnectionName: async function (context) {
    // TODO: Fetch the name of the account.
    let name = "";
    return name;
  },
});
