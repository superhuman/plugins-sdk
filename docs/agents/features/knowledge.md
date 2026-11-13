---
nav: Knowledge search
description: Search knowledge indexed by connectors and resolve contacts by name.
---

# Searching through knowledge

Agents can search knowledge from records their connectors have indexed. This lets them find relevant information across a connector's data without loading every record into the conversation. See the [Indexing guide][indexing] to learn how to build a connector that adds records to the knowledge layer.


## Contact resolution

People are often named in writing, while connectors need an email address or another stable ID. Contact resolution lets the agent search for a person and get back a name and email address.

{{screenshot("images/agent_contacts.png", "An agent resolving a first name to an email address")}}

Those contacts are gathered from the connectors the user has installed. While indexing records into the knowledge layer, :superhuman-go: Go also indexes the people mentioned in those records. The pooled contacts are available to every agent the user has installed, including agents that don't use the connector the contact came from.


[indexing]: ../../guides/blocks/sync-tables/indexing/index.md
