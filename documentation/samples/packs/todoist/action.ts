import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Action formula (for buttons and automations) that adds a new task in Todoist.
connector.addFormula({
  name: "AddTask",
  description: "Add a new task.",
  parameters: [
    sdk.makeParameter({
      type: sdk.ParameterType.String,
      name: "name",
      description: "The name of the task.",
    }),
  ],
  resultType: sdk.ValueType.String,
  isAction: true,

  execute: async function ([name], context) {
    let response = await context.fetcher.fetch({
      url: "https://api.todoist.com/api/v1/tasks",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: name,
      }),
    });
    // Return values are optional but recommended. Returning a URL or other
    // unique identifier is recommended when creating a new entity.
    return "https://app.todoist.com/app/task/" + response.body.id;
  },
});

// Allow the connector to make requests to Todoist.
connector.addNetworkDomain("todoist.com");

// Setup authentication using a Todoist API token.
connector.setUserAuthentication({
  type: sdk.AuthenticationType.HeaderBearerToken,
  instructionsUrl: "https://todoist.com/app/settings/integrations",
});
