import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Per-user authentication to Google APIs, using OAuth2.
// See https://developers.google.com/identity/protocols/oauth2/web-server
connector.setUserAuthentication({
  type: sdk.AuthenticationType.OAuth2,
  authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",

  // All scopes: https://developers.google.com/identity/protocols/oauth2/scopes
  scopes: [
    "profile",
  ],

  // Additional parameters to ensure a refresh_token is returned.
  additionalParams: {
    access_type: "offline",
    prompt: "consent",
  },

  // Determines the display name of the connected account.
  getConnectionName: async function (context) {
    let response = await context.fetcher.fetch({
      method: "GET",
      url: "https://www.googleapis.com/oauth2/v1/userinfo",
    });
    let user = response.body;
    return user.name;
  },
});

// Allow the connector to make requests to Google.
connector.addNetworkDomain("googleapis.com");
