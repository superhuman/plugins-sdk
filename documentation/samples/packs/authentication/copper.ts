import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Per-user authentication to the Copper API, using multiple HTTP headers.
// See https://developer.copper.com/introduction/requests.html#headers.
connector.setUserAuthentication({
  type: sdk.AuthenticationType.MultiHeaderToken,
  headers: [
    { name: "X-PW-AccessToken", description: "API key" },
    { name: "X-PW-UserEmail", description: "Email address" },
  ],

  // Determines the display name of the connected account.
  getConnectionName: async function (context) {
    let response = await context.fetcher.fetch({
      method: "GET",
      url: "https://api.copper.com/developer_api/v1/account",
      headers: {
        "X-PW-Application": "developer_api",
      },
    });
    let account = response.body;
    return account.name;
  },
});

// Allow the connector to make requests to Copper.
connector.addNetworkDomain("copper.com");
