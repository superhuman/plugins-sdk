{# kind ("agent" or "connector"). -#}
=== ":octicons-terminal-16: CLI"

    1.  Upload the code.

        ```sh
        npx packs upload pack.ts
        ```

{% if kind == "agent" %}
    1.  Install the agent into your account.

        ```sh
        npx packs agent install pack.ts
        ```

    1.  Open the agent's settings URL, as output by the command above.

    !!! info "Certain changes require reinstall"
    
        When you install an agent the routines are copied to your instance. If you change your routines code you'll need to reinstall the agent to test it. After uploading the new Pack version, run `npx packs agent install pack.ts --reinstall`.
{% endif %}

=== ":octicons-browser-16: Pack Studio"

    1.  Click the **Build** button.

        This checks your code for errors and creates a new version. It can take a few seconds to complete.

{% if kind == "agent" %}
    1.  When the build finishes, click **Install in Go**.

    1.  Click **Install agent**.
{% endif %}
