---
date: 2026-10-22
slug: packs-to-plugins
description: We're renaming Packs to Plugins, to align with industry standards.
authors:
  - eric.koleda
categories:
  - Updates
---

# Renaming Packs to Plugins

The term "Pack" was chosen back in 2018, when Coda launched it as the way to connect docs to other apps. It's served us well over these last 8 years, but there has always been a bit of a learning curve for new developers, since it's not a standard term in the industry.

We've decided it's time to simplify things, and we're going to start using the term "Plugins" going forward. The rename will show up gradually over the coming months. The first step is live today: the SDK repository has moved from [`coda/packs-sdk`][old_repo] to [`superhuman/plugins-sdk`][repo].

Your Packs keep running as before, and there's nothing you need to change right now. Future changes to the npm package and the SDK may require updates, and we'll announce those changes here as they happen.


[old_repo]: https://github.com/coda/packs-sdk
[repo]: https://github.com/superhuman/plugins-sdk
