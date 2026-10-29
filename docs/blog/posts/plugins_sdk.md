---
date: 2026-10-29
slug: plugins-sdk
description: The SDK npm package is now published as @superhuman/plugins-sdk.
authors:
  - eric.koleda
categories:
  - Updates
---

# The SDK npm package is now @superhuman/plugins-sdk

We've renamed the npm package for this library from [`@codahq/packs-sdk`][old_npm] to [`@superhuman/plugins-sdk`][npm]. The new package is backwards compatible, so updating the import is the only code change required.

There's no urgency to switch. Packs built with the old SDK will continue to function for the foreseeable future. New versions are published as `@superhuman/plugins-sdk`, so install that package when you want access to the latest SDK features.

The [migration guide][guide] walks through installing the package and updating your imports.


[old_npm]: https://www.npmjs.com/package/@codahq/packs-sdk
[npm]: https://www.npmjs.com/package/@superhuman/plugins-sdk
[guide]: ../../support/migration/plugins-sdk.md
