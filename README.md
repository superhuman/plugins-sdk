[![npm release](https://img.shields.io/npm/v/@superhuman/plugins-sdk?color=%23F8AD40&logo=coda&logoColor=%23EE5A29&style=flat-square)](https://www.npmjs.com/package/@superhuman/plugins-sdk)
[![Downloads](https://img.shields.io/npm/dt/@superhuman/plugins-sdk?color=%23F8AD40&label=npm%20downloads&style=flat-square)](https://coda.io/gallery?filter=Packs)
[![Community](https://img.shields.io/discourse/users?color=%23F8AD40&label=community&logo=coda&server=https%3A%2F%2Fcommunity.coda.io%2F&style=flat-square)](https://community.coda.io)

# Superhuman Plugins SDK

Superhuman plugins allow you to extend the Superhuman suite, creating agents for Go and adding building blocks to Docs. To learn more, see [our SDK documentation](https://docs.superhuman.com/packs/build).

## Agent skills

This repo ships [coding-agent skills](.agents/README.md) for building connector plugins and Go agent plugins.
The portable bundle supports Cursor and Codex. The existing `create-agent-pack` skill covers
`sdk.newAgent()`; `plugin-scaffold`, `plugin-tools`, and `plugin-test-upload` cover connector plugins
built with `sdk.newConnector()`.

Install a skill with the [`skills` CLI](https://github.com/vercel-labs/skills):

```bash
bunx skills add superhuman/plugins-sdk --skill create-agent-pack --global
```

See the [bundle guide](.agents/README.md) to install all four skills from a checkout or contribute changes.

## Contributing

See our [Contributing guide](CONTRIBUTING.md) for more information on how to contribute to this project.
