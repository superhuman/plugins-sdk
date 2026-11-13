import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// System-wide authentication to the Giphy API, using an API key in the query
// string. See https://support.giphy.com/hc/en-us/articles/360020283431.
connector.setSystemAuthentication({
  type: sdk.AuthenticationType.QueryParamToken,
  paramName: "api_key",
});

// Allow the connector to make requests to Giphy.
connector.addNetworkDomain("giphy.com");
