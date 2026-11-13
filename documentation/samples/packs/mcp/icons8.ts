import * as coda from "@superhuman/plugins-sdk";

export const connector = coda.newConnector();

connector.addMCPServer({
  name: "Icons8",
  endpointUrl: "https://mcp.icons8.com/mcp/",
});

connector.addNetworkDomain("icons8.com");
