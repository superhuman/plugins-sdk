# SDK releases

## First publish as @superhuman/plugins-sdk

This is an interactive, direct npm publication of the current version under the
new name. It creates the registry package on the first successful publish. It
keeps the version sequence and changelog history and does not create Git commits,
tags, pushes, or GitHub releases. Do not use `make release`, `make release-manual`,
or `--ci` for this bootstrap.

Before publishing, confirm internal deployment and source/export alignment so
later SDK exports preserve the new package identity. The pending export PR #3702
still uses the old identity; this public change alone does not establish internal
readiness. Confirm every intended export has merged before proceeding.

Use the supported Node version pinned in `.nvmrc` and the pinned pnpm installed
by `make bootstrap`. From a clean checkout of `main`:

```sh
git switch main
git pull --ff-only origin main
source setup-env.sh
make bootstrap
node -p "require('./package.json').name" # must be @superhuman/plugins-sdk
node -p "require('./package.json').version" # keep the current version
make build
```

Inspect the actual artifact outside the checkout, including its name, version,
entry points, declarations, binaries, and public access/registry metadata:

```sh
artifact_dir=$(mktemp -d)
npm pack --ignore-scripts --pack-destination "$artifact_dir"
tar -tzf "$artifact_dir"/*.tgz
tar -xOf "$artifact_dir"/*.tgz package/package.json
```

Log in with an npm account authorized to publish in the `@superhuman` scope and
complete interactive 2FA. No manually minted automation token or GitHub token is
needed for this path. Access to `@codahq/packs-sdk` does not establish access to
the new package.

```sh
npm login --registry=https://registry.npmjs.org
```

Immediately before **each** release-it invocation below, run these checks and
stop if any command fails. `git status --porcelain` must produce no output,
including untracked files; `HEAD` must equal the freshly fetched `origin/main`.
Release-it's clean-tree check ignores untracked files, and its upstream check
only establishes that a tracking branch exists.

```sh
git fetch origin main &&
test -z "$(git status --porcelain)" &&
  test "$(git branch --show-current)" = main &&
  test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
```

Preview interactively (a dry-run checks authentication but does **not** prove
publish permission):

```sh
.pnpm_install/bin/pnpm exec release-it --config .github/releases/first-publish.config.cjs --dry-run
```

Repeat the checks above, then publish interactively and complete npm 2FA:

```sh
.pnpm_install/bin/pnpm exec release-it --config .github/releases/first-publish.config.cjs
```

After publication, confirm npm `latest` and installation in a fresh directory:

```sh
npm view @superhuman/plugins-sdk name version dist-tags --registry=https://registry.npmjs.org
consumer_dir=$(mktemp -d)
(cd "$consumer_dir" && npm init -y && npm install @superhuman/plugins-sdk --registry=https://registry.npmjs.org && npx packs --version)
```

Before subsequent CI releases, an operator must supply a stage-only token
authorized for `@superhuman/plugins-sdk` to the existing `sdk-release` environment's
`NPM_TOKEN` secret and confirm release protection configuration. The current
token's access to `@codahq/packs-sdk` is insufficient evidence of new-package
access. Keep the staged approval policy and OIDC limitation described below.

## Prepare

1. Complete the documentation import, SDK export and internal deployment. Confirm
   all changes intended for release have been exported and merged to `main`.
2. Run **Prepare SDK release** on `main` with the new stable version. Confirm the
   exported changes and approve `sdk-release`. Leave `dry-run` unchecked (the
   default) to push a `sdk-release/v<version>` branch and open a release PR.
3. Review the changelog and diff, then merge after CI passes.

For an optional preview, check `dry-run`. The job prepares the version, changelog
and generated files in its temporary checkout and prints the diff without pushing
a branch or opening a PR. Run Prepare again with `dry-run` unchecked to create the
release PR.

## Publish

Merging the PR created by **Prepare SDK release** starts **Publish SDK release**.
After validation, confirm internal deployment is current and approve `sdk-release`.
The job stages the npm package, tags the merge commit and creates a draft GitHub
release. The run summary includes the npm approval command and draft URL. The
package is not public yet.

The job uses the **Publish SDK release token**, created on the
`parkerlandon-codaio` npm account and stored as `NPM_TOKEN` in the `sdk-release`
environment. The token expires on **January 12, 2027**.

We use an access token because npm's OIDC token exchange returns HTTP 401 with
our GitHub Enterprise issuer, matching the reported
[enterprise-scoped OIDC issuer issue](https://github.com/npm/cli/issues/9203).

Inspect the stage and check npm `latest`. Any maintainer with publish access to
`@superhuman/plugins-sdk` can approve using their own npm account and 2FA on npmjs.com
or with `npm stage approve <stage-id>`; approval does not require the token
owner's account. After npm approval, publish the
GitHub draft using the summary link. If a newer GitHub release exists, leave
**Set as latest release** unchecked. Complete the documentation deployments and
internal dependency update.

To validate without submitting a package, run **Publish SDK release** manually
on `main`. Enter the merged PR number in `release-pr` (e.g. `1234`) and leave
`dry-run` checked.

## Troubleshooting and retries

If preparation reports **No new version selected**, release-it did not change the
version or create a PR. This can happen if the requested version is invalid or
older than `package.json`. Correct the version and run preparation again.
If preparation pushed its branch but failed to open the PR, open a PR from that
branch to `main`, or delete the branch before preparing again.

If publication fails, inspect the run log, npm stages and GitHub releases before
retrying. The summary retains any approval command or draft URL produced before
the failure. If the stage and draft already exist, approve npm and publish the
draft; no further CI run is needed.

To retry publication, run **Publish SDK release** manually on `main`
with the same `release-pr` number and `dry-run` unchecked. If npm accepted the
submission, or the version was already published, select `skip-npm` to finish the
missing Git/GitHub steps without resubmitting. Otherwise leave `skip-npm` unchecked.

The workflow on `main` resolves the selected PR's original merge commit and uses
that commit for validation and publication, even after `main` advances.

If a retry reports an existing draft or a rejected tag push, inspect that draft
and tag before trying again. Never move an existing release tag to another commit.

## Stop automated publication

To prevent new runs from submitting npm packages or creating tags and GitHub
releases, set the repository variable `PACKS_SDK_PUBLISH_ENABLED` to `false`.
Cancel pending or running release workflows too; changing the variable does not
stop a job already running. This does not remove an existing npm stage, tag or
GitHub draft.

Cancel pending or running release workflows before changing approval policy.
