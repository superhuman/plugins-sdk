import * as sdk from "@superhuman/plugins-sdk";

const connector = sdk.newConnector();

// BEGIN
connector.addNetworkDomain("${1:example.com}");
