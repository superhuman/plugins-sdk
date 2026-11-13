import * as sdk from "@superhuman/plugins-sdk";

const connector = sdk.newConnector();

// BEGIN

connector.setUserAuthentication({
  type: sdk.AuthenticationType.OAuth2ClientCredentials,
  // The following URL will be found in the API's documentation.
  tokenUrl: "${1:https://example.com/token}",
});
