import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Per-user authentication to the Asana API, using OAuth2.
// See https://developers.asana.com/docs/oauth
connector.setUserAuthentication({
  type: sdk.AuthenticationType.OAuth2,
  authorizationUrl: "https://app.asana.com/-/oauth_authorize",
  tokenUrl: "https://app.asana.com/-/oauth_token",

  // Enable PKCE (required).
  useProofKeyForCodeExchange: true,

  // Determines the display name of the connected account.
  getConnectionName: async function (context) {
    let response = await context.fetcher.fetch({
      method: "GET",
      url: "https://app.asana.com/api/1.0/users/me",
    });
    let user = response.body.data;
    return user.name;
  },
});

// Allow the connector to make requests to Asana.
connector.addNetworkDomain("asana.com");
