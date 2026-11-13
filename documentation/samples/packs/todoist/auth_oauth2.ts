import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Per-user authentication to the Todoist API, using an OAuth2 flow.
// See https://developer.todoist.com/guides/#oauth
connector.setUserAuthentication({
  type: sdk.AuthenticationType.OAuth2,
  authorizationUrl: "https://app.todoist.com/oauth/authorize",
  tokenUrl: "https://api.todoist.com/oauth/access_token",
  scopes: ["data:read_write"],

  // Determines the display name of the connected account.
  getConnectionName: async function (context) {
    let response = await context.fetcher.fetch({
      method: "GET",
      url: "https://api.todoist.com/api/v1/user",
    });
    return response.body.full_name;
  },
});

// Allow the connector to make requests to Todoist.
connector.addNetworkDomain("todoist.com");
