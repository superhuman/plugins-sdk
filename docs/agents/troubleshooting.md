---
nav: Troubleshooting
description: Troubleshoot agent runs and test while-writing agents.
cSpell:words: textarea hypernotepad
---

# Troubleshooting

When an agent does not behave as expected, start by checking its logs. Agent logs show the context provided to the model, the actions it took, and the responses it produced. See the [logging guide][agent-logs] for instructions to open and use the logs.


## Monitor while-writing agents

To see which agents with while-writing triggers are active, move the pointer to the right edge of the page and click **Writing suggestions** in the tab that appears.

The dialog lists the agents watching the page, whether they are running or finished, and how many underlines they produced.

<section class="tutorial-row" markdown>
<div markdown>

{{screenshot("images/agent_writing_tab.png", "The Writing suggestions control beside the page")}}

</div>
<div markdown>

{{screenshot("images/agent_writing_panel.png", "Agents for writing, with one agent checking the page")}}

</div>
</section>

Agents run automatically as the user types. To start one manually, hover over it, click the chevron, and select **Recheck**.

{{screenshot("images/agent_writing_recheck.png", "The Recheck action on a while-writing agent")}}

## Recommended apps for testing

:superhuman-go: Go works across the apps and sites Grammarly supports, but behavior can vary in ways that make testing an agent difficult. We recommend using the following simple text editors for your initial testing:

- [textarea.org](https://textarea.org)
- [hypernotepad.com](https://hypernotepad.com/)

[agent-logs]: ../development/logging.md#agent-logs
