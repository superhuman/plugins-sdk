import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Per-user authentication to the Okta API, using a custom token prefix and
// account-specific endpoints.
// See https://developer.okta.com/docs/reference/core-okta-api/#authentication
connector.setUserAuthentication({
  type: sdk.AuthenticationType.CustomHeaderToken,
  headerName: "Authorization",
  tokenPrefix: "SSWS",

  // Ask users for their Okta subdomain.
  requiresEndpointUrl: true,
  endpointDomain: "okta.com",

  // Determines the display name of the connected account.
  getConnectionName: async function(context) {
    // Retrieve the endpoint that the user set.
    let endpoint = context.endpoint;
    let url = endpoint + "/api/v1/org";
    let response = await context.fetcher.fetch({
      method: "GET",
      url: url,
    });
    return response.body.companyName;
  },
});

// Allow the connector to make requests to Okta.
connector.addNetworkDomain("okta.com");
