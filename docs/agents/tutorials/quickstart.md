---
nav: Build your first agent
description: Learn how to build an agent for Superhuman Go.
icon: material/rocket-launch
hide:
- toc
cSpell:words: FedEx textarea DLP
---

# Build your first agent for Superhuman Go

This tutorial builds an agent with the Packs SDK and installs it in :superhuman-go: Go. You'll set up a project, write the code, and try the result.

!!! abstract "Goal"
    Build a while-writing agent that watches the page for package tracking numbers and shows a status card for each one.

{% with kind="agent" %}
{% include ".snippets/tutorial-intro.md" %}
{% endwith %}


## :material-crane: Set up the project

{% with directory="package-tracker", pack_name="Package Tracker", kind="agent" %}
{% include ".snippets/setup.md" %}
{% endwith %}


## :fontawesome-solid-laptop-code: Write the code

Now let's add some code to the Pack. If you're using the CLI replace the contents of `pack.ts`, and in the Pack Studio replace the contents of the editor.

=== ":material-numeric-1-circle: Add the boilerplate"

    <section class="tutorial-row" markdown>
    <div markdown>

    Start by importing the SDK and creating the agent definition.

    </div>
    <div markdown>

    ```ts
    --8<-- "samples/packs/agents/package_tracker.ts:boilerplate"
    ```

    </div>
    </section>


=== ":material-numeric-2-circle: Add the instructions"

    <section class="tutorial-row" markdown>
    <div markdown>

    Set the instructions the agent should follow with `setInstructions()`. They are passed to the LLM when the agent is run.

    This agent's instructions tell it to find tracking numbers on the page and what to put on each card.

    </div>
    <div markdown>

    ```{.ts hl_lines="4-16"}
    import * as sdk from "@superhuman/plugins-sdk";
    export const agent = sdk.newAgent();

    --8<-- "samples/packs/agents/package_tracker.ts:instructions"
    ```

    </div>
    </section>


=== ":material-numeric-3-circle: Add the connectors"

    <section class="tutorial-row" markdown>
    <div markdown>

    Set what tools the agent can access with `setTools()`. Connectors are referenced by `connectorId`.

    This agent uses the [FedEx][fedex] and [UPS][ups] connectors to look up a tracking number.

    Anything left out of `setTools()` is off, so the agent can only call the connectors you list.

    </div>
    <div markdown>

    ```{.ts hl_lines="8-15"}
    import * as sdk from "@superhuman/plugins-sdk";
    export const agent = sdk.newAgent();

    agent.setInstructions(`
      ...
    `);

    --8<-- "samples/packs/agents/package_tracker.ts:tools"
    ```

    </div>
    </section>


=== ":material-numeric-4-circle: Add the routine"

    <section class="tutorial-row" markdown>
    <div markdown>

    Add a while-writing routine with `addDefaultRoutine()`. The agent runs automatically as the user types.

    The `condition` limits the routine to running only when a tracking number is in the writing, and `blockedDomains` keeps it from running on the carriers' own tracking pages.

    </div>
    <div markdown>

    ```{.ts hl_lines="12-19"}
    import * as sdk from "@superhuman/plugins-sdk";
    export const agent = sdk.newAgent();

    agent.setInstructions(`
      ...
    `);

    agent.setTools({
      // ...
    });

    --8<-- "samples/packs/agents/package_tracker.ts:routine"
    ```

    </div>
    </section>

---

??? example "View the full code"
    ```ts
    --8<-- "samples/packs/agents/package_tracker.ts"
    ```


## :material-cloud-upload: Upload & install

The code needs to be uploaded to Superhuman's servers and then the agent can be installed.

{% with kind="agent" %}
{% include ".snippets/upload-install.md" %}
{% endwith %}

## :material-connection: Finish agent setup

<section class="tutorial-row" markdown>
<div markdown>

On the agent's settings screen, click **Connect** next to the **FedEx** and **UPS** connectors.

These connectors don't require credentials, so they connect immediately. Other connectors may require credentials. Clicking **Connect** starts the sign-in flow.


</div>
<div markdown>

{{screenshot("images/agent_connect.png", "The connect buttons on the agent settings screen")}}

</div>
</section>


## :superhuman-go: Try it in Go

The agent is installed, so it's time to try it on a page and see the tracking card.

=== ":material-numeric-1-circle: Paste the tracking numbers"

    <section class="tutorial-row" markdown>
    <div markdown>

    Open [textarea.org](https://textarea.org) (a simple text editor, useful for testing agents) and paste in the following text:

    ```
    I sent the packages today, and the tracking numbers 
    are 1ZAF99490399806464 and 495933499081.
    ```

    </div>
    <div markdown>

    {{screenshot("images/agent_textarea.png", "Tracking numbers pasted into textarea.org")}}

    </div>
    </section>


=== ":material-numeric-2-circle: Check the card"

    <section class="tutorial-row" markdown>
    <div markdown>

    Wait a few moments. The tracking numbers should be underlined, and hovering one should show a shipping card.

    </div>
    <div markdown>

    {{screenshot("images/agent_tracking_card.png", "A shipping status card on an underlined tracking number")}}

    </div>
    </section>


!!! info "Troubleshooting"

    If you've waited for a while and no underlines appear, try running the agent manually. Open the [writing suggestions panel][navigation_agents_for_writing]{ data-preview }. Find the **Package Tracker** agent in the list, open its menu, and click **Recheck**.

    If the card says the tracking number is invalid, check whether the account has [data loss prevention][dlp] enabled. That feature rewrites sensitive-looking text before the agent sees it, which can change a tracking number.


## :material-fast-forward: Next steps

Now that you have an agent running, here are some more resources you can explore:

- [Examples][examples] - See more examples of working agents.
- [Routines and triggers][triggers] - Set up your agent to run automatically as the user works.
- [Screen annotations][screen_annotations] - Add comments or rewrites to the screen to inform the user.



[navigation_agents_for_writing]: ../../support/navigation.md#agents-for-writing
[fedex]: https://superhuman.com/store/connectors/fedex-1070
[ups]: https://superhuman.com/store/connectors/ups-1071
[dlp]: https://support.grammarly.com/hc/en-us/articles/27458670736525-Enable-Data-Loss-Prevention-DLP
[triggers]: ../features/triggers.md
[screen_annotations]: ../features/screen-annotations.md
[examples]: ../examples/index.md
