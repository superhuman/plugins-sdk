import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Set per-user authentication using Dropbox's OAuth2.
// See https://developers.dropbox.com/oauth-guide
connector.setUserAuthentication({
  type: sdk.AuthenticationType.OAuth2,
  authorizationUrl: "https://www.dropbox.com/oauth2/authorize",
  tokenUrl: "https://api.dropbox.com/oauth2/token",
  scopes: ["files.content.read"],

  // Additional parameters to ensure a refresh_token is returned.
  additionalParams: {
    token_access_type: "offline",
  },
});

// Allow access to the Dropbox domain.
connector.addNetworkDomain("dropboxapi.com");
