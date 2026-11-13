import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

connector.addMCPServer({
  name: "Todoist",
  endpointUrl: "https://ai.todoist.net/mcp",
});

connector.setUserAuthentication({
  type: sdk.AuthenticationType.OAuth2,
  useDynamicClientRegistration: true,
  useProofKeyForCodeExchange: true,
});

connector.addNetworkDomain("todoist.net");
