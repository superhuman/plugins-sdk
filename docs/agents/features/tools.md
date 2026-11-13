---
nav: Tools & connectors
description: Choose which tools an agent can use.
---

# Tools and connectors

Tools help an agent find information and take action. Every agent has :superhuman-go: Go's built-in tools, and you can give it access to other products by adding their tools to the agent definition.

Use `setTools()` to choose what your agent can access. Give it the tools it needs for the job, and leave out the rest so it can stay focused.


## Superhuman products

Agents can be given direct access to the data in other Superhuman products. Enable the `docs` tool for :superhuman-docs: Docs, or the `mail` tool for :superhuman-mail: Mail.

```ts
agent.setTools({
  docs: true,
  mail: true,
});
```


## Connectors

To allow the agent to access data in other applications, provide a list of `connectors` it can use. These can be connectors you've created or ones available in the [Superhuman Store][store]. When installing the agent, users will be prompted to install any connectors they haven't already installed.

Connectors are referenced by `connectorId`. You can get the ID for a connector from its URL in the store.

```ts
agent.setTools({
  connectors: [
    // GitHub: https://superhuman.com/store/connectors/github-1013
    { connectorId: 1013 },
    // Atlassian: https://superhuman.com/store/connectors/atlassian-53840
    { connectorId: 53840 },
  ],
});
```

!!! info "Agents and connectors have separate ACLs"

    Agents and connectors are independent Packs, each with their own set of permissions. If you are sharing or publishing an agent, remember to also share or publish any connectors you've built for it.


## Web search

The `webSearch` tool allows your agent to search the internet for information or fetch data from a public URL. It's useful when it needs to do deeper research or reference information that may have changed after the LLM's training cutoff.

```ts
agent.setTools({
  webSearch: true,
});
```

You can limit which domains the search results come from by specifying the `allowedDomains` field.

```ts
agent.setTools({
  webSearch: { allowedDomains: ["github.com"] },
});
```

When used to retrieve information from a specific URL, and the user did not supply that URL, :superhuman-go: Go will require the user to approve the tool call first.


[store]: https://superhuman.com/store/connectors
