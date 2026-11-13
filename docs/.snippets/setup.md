{# directory, pack_name, and kind ("agent" or "connector"). -#}
=== ":octicons-terminal-16: CLI"

    Building with the CLI requires `node`, `npm`, and `git`.

    1.  Create a directory for the {{ kind }} and initialize the project.

        ```sh
        mkdir {{ directory }}
        cd {{ directory }}
        npm init --yes
        npm install --save @superhuman/plugins-sdk
        ```

        The SDK bundles the `packs` CLI along with the libraries used to build a Pack.

    1.  Scaffold the files for a new Pack.

        ```sh
        npx packs init{% if kind == "agent" %} --agent --name "{{ pack_name }}"{% endif %}
        ```

        This creates a `pack.ts` with some starter code, which you'll replace in the next section.

    1.  Register an API token, which the CLI uses to talk to the platform.

        ```sh
        npx packs register
        ```

        You'll be prompted to generate a token in your browser. Name the token, copy it, and paste it back into the terminal. The token is saved to `.coda.json`, and only needs to be done once per directory.

    1.  Create the empty Pack that will hold the {{ kind }}.

        ```sh
        npx packs create pack.ts --name "{{ pack_name }}"
        ```

        This prints the Pack Studio URL and writes the new Pack's ID to `.coda-pack.json`.

=== ":octicons-browser-16: Pack Studio"

    The Pack Studio is the code editor built into Superhuman Docs, and there's nothing to install.

    1.  Open <https://pack.new> to [create a new Pack][navigation_create_pack]{ data-preview }.

    1.  Choose to start from scratch rather than from one of the examples.

    1.  Click the Pack name **Untitled Pack** in the upper left and change it to "{{ pack_name }}".

[navigation_create_pack]: /support/navigation.md#create-pack
