---
nav: Home
description: Extend Superhuman with your own code. Build agents that do a job for your users, and connectors that bring in data and actions from other apps.
hide:
  - navigation
  - toc
  - icons
---

<div class="home-hero" markdown>

# Build agents and connectors for Superhuman

The Plugins SDK lets you extend Superhuman with your own code. Build [**agents**](#agents) that provide assistance and do work, and [**connectors**](#connectors) that bring another app's data and actions into Superhuman.

All you need to do is write a little TypeScript code to define your plugin. Superhuman hosts it, runs it, and provides the LLM, so there's no infrastructure to maintain. Build once, and the same code will work across :superhuman-go: Go and :superhuman-docs: Docs.

</div>

<section class="landing-row" markdown>

<div class="landing-item" markdown>

## :material-robot: Create an agent {:#agents}

An agent is an assistant in Superhuman Go built around a job. You give it instructions, choose the tools it can use, and add routines that tell it when to step in.

It can help while the user writes, run in the background on a schedule or when an email or Slack message arrives, and answer questions in chat.

[Build your first agent][agent_quickstart]{ .md-button .md-button--primary }
</div>

<div class="landing-item" markdown>
<video style="width:auto" loop muted autoplay alt="Using an agent in Superhuman Go" class="screenshot"><source src="site:images/go_agent.mp4" type="video/mp4"></source></video>
</div>

</section>

<section class="box-row" style="margin: 2em 0;" markdown>

<div class="box-item" markdown>
### :material-pencil-outline: Help while the user writes

Watch what the user is writing and attach a card that adds context or suggests a rewrite, right on the page.

[Screen annotations][screen_annotations]{ .md-button }
</div>

<div class="box-item" markdown>
### :material-clock-outline: Work in the background

Run on a schedule, or when an email or Slack message arrives. Send a Monday standup, or draft a reply before the user asks.

[Routines and triggers][triggers]{ .md-button }
</div>

<div class="box-item" markdown>
### :material-chat-outline: Answer in chat

Users open your agent in the Go side panel or desktop app to ask a question or start a task, with suggested prompts to get them going.

[Chat][chat]{ .md-button }
</div>

</section>

=== "Give feedback while writing"

    ```ts
    --8<-- "samples/packs/agents/holiday_conflicts_simple.ts"
    ```

=== "Respond to messages in Slack"

    ```ts
    --8<-- "samples/packs/agents/slack_action_item.ts"
    ```

[More agent examples][agent_examples]{ .md-button } 

---

<section class="landing-row" markdown>

<div class="landing-item" markdown>
## :material-connection: Connect your data {:#connectors}

Superhuman Go supports the MCP standard, so any app that hosts a server can plug straight in. MCP servers are distributed as connectors, and once installed Go can access all of the tools they provide.

Creating a connector for your MCP server is simple, often requiring as little as a dozen lines of code. When it's ready, you can publish it to the store so anyone can discover and install it.

[List your MCP][mcp_tutorial]{ .md-button .md-button--primary }
</div>

<div class="landing-item" markdown>
<video style="width:auto" loop muted autoplay alt="Using MCP tools in Superhuman Go" class="screenshot"><source src="site:images/go_mcp.mp4" type="video/mp4"></source></video>
</div>

</section>

<section class="box-row" style="margin: 2em 0;"  markdown>

<div class="box-item" markdown>
### :material-toolbox: Build tools for any REST API

 Not every app has an MCP server, but most have a REST API. Write your own tools hosted on our servers and available in Superhuman Go just like MCP tools.

[Build a custom tool][tutorial_fetcher]{ .md-button }
</div>

<div class="box-item" markdown>
### :material-text-box-search: Answer questions from your data

Sync your records into the knowledge layer and Superhuman Go can search them, cite them, and answer from them in the middle of a conversation.

[Build a sync table][tutorial_sync]{ .md-button }
</div>

<div class="box-item" markdown>
### :material-plus-box: Extend what a doc can do

Create custom formulas and sync tables that fit right into Superhuman Docs. Users work with your app's data without leaving their doc.

[Building blocks][blocks_table]{ .md-button }
</div>

</section>

=== "Connect to MCP server"

    ```ts
    --8<-- "samples/packs/todoist/mcp.ts"
    ```

=== "Create custom tools"

    ```ts
    --8<-- "samples/packs/todoist/action_simple.ts"
    ```

=== "Sync records"

    ```ts
    --8<-- "samples/packs/todoist/sync_table_simple.ts"
    ```

[More connector samples][samples]{ .md-button }

---

<section class="landing-row landing-row-reverse" markdown>

<div class="landing-item" markdown>
## :fontawesome-regular-lightbulb: See what others have built.

Agents and connectors are listed in the [Superhuman Store][store], and connectors also appear in the [Superhuman Docs Gallery][gallery]. Install a few to get a feel for what yours could do.

[Browse the Store][store]{ .md-button }
</div>

<div class="landing-item" markdown>
{{screenshot("images/store_connectors.png", "Connectors listed in the Superhuman Go Store.")}}
</div>

</section>

---

Stuck, or want to see it done first? There's a [library of videos][videos] walking through the basics, and a [community][community] of developers happy to answer questions.


[agent_quickstart]: agents/tutorials/quickstart.md
[agent_examples]: agents/examples/index.md
[agent_tools]: agents/features/tools.md
[screen_annotations]: agents/features/screen-annotations.md
[triggers]: agents/features/triggers.md
[chat]: agents/features/chat.md
[quickstart_cli]: tutorials/get-started/cli.md
[quickstart_web]: tutorials/get-started/web.md
[samples]: samples/index.md
[tutorials]: tutorials/index.md
[community]: https://connect.superhuman.com/c/developers-central/making-packs/15
[videos]: tutorials/videos.md
[gallery]: https://coda.io/gallery?filter=packs
[store]: https://superhuman.com/store
[blocks_table]: guides/overview.md#connectors
[tutorial_fetcher]: tutorials/build/fetcher.md
[tutorial_sync]: tutorials/build/sync-table.md
[mcp_tutorial]: tutorials/build/mcp.md
