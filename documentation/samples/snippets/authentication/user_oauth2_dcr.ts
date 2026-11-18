import * as sdk from "@superhuman/plugins-sdk";

const connector = sdk.newConnector();

// BEGIN

connector.setUserAuthentication({
  type: sdk.AuthenticationType.OAuth2,
  useDynamicClientRegistration: true,
  useProofKeyForCodeExchange: true,
  scopes: [
    // TODO: List the API scopes to request, if any.
  ],
});
