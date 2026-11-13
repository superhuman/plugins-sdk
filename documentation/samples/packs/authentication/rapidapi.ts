import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// System-wide authentication to RapidAPI, using an API key in a custom header.
// See https://docs.rapidapi.com/docs/keys#how-to-find-your-api-key.
connector.setSystemAuthentication({
  type: sdk.AuthenticationType.CustomHeaderToken,
  headerName: "X-RapidAPI-Key",
});

// Allow the connector to make requests to RapidAPI.
connector.addNetworkDomain("rapidapi.com");
