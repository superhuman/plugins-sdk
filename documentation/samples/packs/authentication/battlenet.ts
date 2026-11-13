import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// System-wide authentication to Blizzard's Battle.net APIs, using the OAuth2
// client_credentials flow.
// oxlint-disable-next-line stylistic/max-len
// See https://develop.battle.net/documentation/guides/using-oauth/client-credentials-flow.
connector.setSystemAuthentication({
  type: sdk.AuthenticationType.OAuth2ClientCredentials,
  tokenUrl: "https://oauth.battle.net/token",
});

// Allow the connector to make requests to Battle.net.
connector.addNetworkDomain("blizzard.com");
