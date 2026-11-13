import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Per-user authentication to the Superhuman Docs API, using a token in the
// Authorization header.
// See https://docs.superhuman.com/developers/apis/v1
connector.setUserAuthentication({
  type: sdk.AuthenticationType.CodaApiHeaderBearerToken,

  // Creates the token automatically when the Pack is installed.
  shouldAutoAuthSetup: true,
});

// Allow the connector to make requests to Superhuman Docs.
connector.addNetworkDomain("docs.superhuman.com");
