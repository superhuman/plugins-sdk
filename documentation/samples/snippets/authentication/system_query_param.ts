import * as sdk from "@superhuman/plugins-sdk";

const connector = sdk.newConnector();

// BEGIN

connector.setSystemAuthentication({
  type: sdk.AuthenticationType.QueryParamToken,
  paramName: "${1:myToken}",
});
