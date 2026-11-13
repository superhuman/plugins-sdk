---
nav: Overview
description: An agent is an assistant in Superhuman Go, built around a specific job to be done
---

# What is an agent?

An agent is an assistant in :superhuman-go: Go, built around a specific job to be done. It has custom instructions that guide its behavior and a defined set of tools it can use. Most agents include routines that allow them to run automatically and provide proactive assistance.


## What an agent can do

{# TODO: Add screenshots for the sections below. #}

### Help while the user writes

While the user is writing, the agent can underline part of the text and attach a card. These cards can include additional context or propose changes. See [Screen annotations][screen_annotations] for more information.

### Run in the background

An agent can run on its own, on a schedule or in response to an event. For example, a morning brief can summarize the user's day, or a Slack bot can respond when it sees a specific keyword. See [Routines and triggers][triggers] for what events an agent can listen for.

### Answer in chat

The user can open the agent in the :superhuman-go: Go side panel or desktop app to ask a question, start a task, or continue a conversation.


## How to build an agent

Agents are defined and distributed as Packs. With the SDK, you write a Pack that describes what your agent should do, which tools it can use, and which routines users can run. That definition shapes the agent they install.

When you upload the Pack, Superhuman hosts the agent, manages its lifecycle, and runs it with the platform's LLM. You can focus on building the agent, with no infrastructure to maintain.

[Build your first agent][quickstart]{ .md-button .md-button--primary }

!!! tip "Prototype in the Agent Builder"

    You can also build agents using the [Agent Builder][builder], a chat and UI interface optimized for individuals and teams. It's a good way to prototype before you write the Pack.


## Agents and connectors

Most agents work with data from other applications, and they use connectors to access that data. Your agent can use any connector from the [Superhuman Store][store_connectors], but you may need to build new connectors for your agent to get the data it needs.

Connectors are also built using this SDK, and each connector lives in a separate Pack. See the [Connectors][connectors] documentation for more information.

[Connect an MCP server][mcp_tutorial]{ .md-button }


[quickstart]: tutorials/quickstart.md
[builder]: https://go.superhuman.com/builder
[triggers]: features/triggers.md
[screen_annotations]: features/screen-annotations.md
[mcp_tutorial]: ../tutorials/build/mcp.md
[connectors]: ../guides/overview.md
[store_connectors]: https://superhuman.com/store/connectors
