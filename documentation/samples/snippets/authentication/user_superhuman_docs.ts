import * as sdk from "@superhuman/plugins-sdk";

const connector = sdk.newConnector();

// BEGIN

connector.setUserAuthentication({
  type: sdk.AuthenticationType.CodaApiHeaderBearerToken,
});
