# Publishing `@lumio/*`

Release runbook for the three packages in this repo — `@lumio/shared`, `@lumio/sdk`, `@lumio/ui`.
They are versioned **together** (see `fixed` in `.changeset/config.json`), so one release bumps all
three in lockstep.

> **Status: prepared, not yet published.** Everything below is wired and dry-run-verified. The repo
> is intentionally stopped just before the first real `changeset publish`. Nothing here has been
> pushed to npm, and no npm token exists in the repo.

## One-time setup

1. Create/claim the `@lumio` scope on [npmjs.com](https://www.npmjs.com/) with an account that has
   publish rights.
2. **Local publishing:** `npm login` (or set `NODE_AUTH_TOKEN`).
   **CI publishing:** create an npm _automation_ token and add it as the `NPM_TOKEN` repository
   secret. That single secret arms `.github/workflows/release.yml`, which is inert until it exists.

## Release flow (Changesets)

```bash
# 1. Record what changed (pick the bump, write a summary). Commit the generated file.
pnpm changeset

# 2. Consume pending changesets: bumps versions + writes CHANGELOGs.
pnpm version-packages

# 3. Build and publish all public packages.
pnpm release        # = turbo run build && changeset publish
```

On CI this is automatic: pushing changesets to `main` opens a "version packages" PR; merging it
triggers `changeset publish` (once `NPM_TOKEN` is set).

## The `workspace:^` → `^x.y.z` expansion

`@lumio/sdk` depends on `@lumio/shared` as `"workspace:^"`. This links locally during development.
Both `changeset publish` and `pnpm publish` **rewrite** it to a real range (e.g. `^0.1.0`) matching
the version being released, so the published manifest is registry-valid. Do not hand-edit it to a
fixed version — let the tooling expand it at publish time.

## After the first publish — switch the apps off `link:`

Once the packages exist on npm, update `lumio-app` to consume the published versions instead of the
sibling checkout. The exact edits are documented in
[`lumio-app/README.md` → "Consuming the published SDK"](https://github.com/lumio-network/lumio-app#consuming-the-published-sdk-once-lumio-is-on-npm).
That removes `lumio-app`'s sibling-checkout + build-SDK-first prerequisite and unblocks its Docker
/ Vercel / CI builds.

## Verify readiness without publishing

```bash
pnpm install
pnpm build && pnpm typecheck && pnpm test && pnpm format:check && pnpm lint
pnpm changeset status
# Inspect each tarball (files, exports, resolved deps, access) without uploading:
pnpm -r --filter "@lumio/*" publish --dry-run --no-git-checks
```
