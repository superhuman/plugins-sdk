import * as coda from "@superhuman/plugins-sdk";

export const connector = coda.newConnector();

connector.addMCPServer({
  name: "Ref_tools",
  endpointUrl: "https://api.ref.tools/mcp",
});

connector.setUserAuthentication({
  type: coda.AuthenticationType.CustomHeaderToken,
  headerName: "x-ref-api-key",
  instructionsUrl: "https://ref.tools/keys",
});

connector.addNetworkDomain("ref.tools");
