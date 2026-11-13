import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Per-user authentication to the Smarty API, using multiple query parameters.
// See https://www.smarty.com/docs/cloud/authentication#keypairs
connector.setUserAuthentication({
  type: sdk.AuthenticationType.MultiQueryParamToken,
  params: [
    { name: "auth-id", description: "The Auth ID of the secret key." },
    { name: "auth-token", description: "The Auth Token of the secret key." },
  ],
});

// Allow the connector to make requests to Smarty.
connector.addNetworkDomain("smartystreets.com");
