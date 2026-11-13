import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Authenticate using a client ID.
// See: https://www.boardgameatlas.com/api/docs/apps
connector.setSystemAuthentication({
  type: sdk.AuthenticationType.QueryParamToken,
  paramName: "client_id",
});

connector.addNetworkDomain("boardgameatlas.com");
