---
nav: Plugins SDK
description: How to switch from the @codahq/packs-sdk package to @superhuman/plugins-sdk.
---

# Migrating to @superhuman/plugins-sdk

The npm package for this library is now published as [`@superhuman/plugins-sdk`][new_npm], previously [`@codahq/packs-sdk`][old_npm]. The new package is backwards compatible, so updating the import is the only code change required. The rest of your Pack stays as it is.

There's no urgency to switch. Packs built with the old SDK will continue to function for the foreseeable future. New versions are published as `@superhuman/plugins-sdk`, so install that package when you want access to the latest SDK features.


## Install the library

In the Pack Studio, both `@codahq/packs-sdk` and `@superhuman/plugins-sdk` are already available.

If you build with the CLI, install the new package and remove the old one:

```sh
npm install @superhuman/plugins-sdk@latest --save
npm uninstall @codahq/packs-sdk
```


## Update your imports

Change the package name on the import line:

```{.ts .no}
import * as sdk from "@codahq/packs-sdk";
```

```{.ts .yes}
import * as sdk from "@superhuman/plugins-sdk";
```

Update every TypeScript file that imports the SDK.


[new_npm]: https://www.npmjs.com/package/@superhuman/plugins-sdk
[old_npm]: https://www.npmjs.com/package/@codahq/packs-sdk
