import * as sdk from "@superhuman/plugins-sdk";

const connector = sdk.newConnector();

// BEGIN

connector.addMCPServer({
  name: "${1:MyMCPServer}",
  endpointUrl: "${2:https://my-mcp-server.com/mcp}",
});
