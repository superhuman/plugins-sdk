import * as sdk from "@superhuman/plugins-sdk";

export const connector = sdk.newConnector();

connector.addMCPServer({
  name: "Miro",
  endpointUrl: "https://mcp.miro.com/",
});

connector.setUserAuthentication({
  type: sdk.AuthenticationType.OAuth2,
  useDynamicClientRegistration: true,
  useProofKeyForCodeExchange: true,
  scopes: ["boards:read", "boards:write"],
});

connector.addNetworkDomain("miro.com");
