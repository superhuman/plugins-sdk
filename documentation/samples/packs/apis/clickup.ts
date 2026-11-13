import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Per-user authentication to the ClickUp API, using OAuth2.
// See https://clickup.com/api
connector.setUserAuthentication({
  type: sdk.AuthenticationType.OAuth2,
  authorizationUrl: "https://app.clickup.com/api",
  tokenUrl: "https://app.clickup.com/api/v2/oauth/token",

  // Determines the display name of the connected account.
  getConnectionName: async function (context) {
    let response = await context.fetcher.fetch({
      method: "GET",
      url: "https://api.clickup.com/api/v2/user",
    });
    let user = response.body.user;
    return user.username;
  },
});

// Allow the connector to make requests to the ClickUp.
connector.addNetworkDomain("clickup.com");
