# Contributing to lumio-sdk

Thanks for your interest in Lumio — an open-source cooperative finance platform for savings
groups (*ajo*, *esusu*, *chamas*, SACCOs) on Stellar / Soroban. This repo holds the TypeScript
layer that connects the [contracts](https://github.com/lumio-network/lumio-contracts) to the
[apps](https://github.com/lumio-network/lumio-app).

Small, focused pull requests are very welcome — including your first one.

## What's in here

| Package | Name | Responsibility |
| --- | --- | --- |
| `packages/shared` | `@lumio/shared` | Shared types + pure utility functions. Base dependency for the others. |
| `packages/sdk` | `@lumio/sdk` | Per-contract clients + `LumioClient`. |
| `packages/ui` | `@lumio/ui` | Design tokens, Tailwind preset, and base components. |

> ⚠️ **Scaffold status.** The `@lumio/sdk` clients currently **stub** their Soroban RPC calls
> (writes throw `NotImplementedError`, reads return typed mock data). Wiring them to deployed
> contracts is a later phase. Issues that don't need on-chain work — the `@lumio/shared` utilities,
> tests, docs, and `@lumio/ui` — are the best place to start and need no Stellar/Soroban knowledge.

## Prerequisites

- **Node.js ≥ 20**
- **pnpm 9.12.0** — `corepack enable` (recommended) or `npm i -g pnpm@9.12.0`

## Getting started

```bash
pnpm install
pnpm build       # builds shared → sdk/ui in dependency order (via Turborepo)
pnpm test        # vitest across all packages
pnpm lint        # eslint
pnpm typecheck   # tsc --noEmit per package
```

Work on a single package with a filter, e.g.:

```bash
pnpm --filter @lumio/shared test
```

## Before you open a PR

CI runs **lint → typecheck → build → test** and must be green. Run the same locally:

```bash
pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

Formatting is checked with Prettier — run `pnpm format` to auto-fix (or `pnpm format:check` to verify).

Every PR that changes files under `packages/` must include a `.changeset/*.md` entry. For a
package change that does not need a release, add an empty changeset instead:

```md
---
---
```

CI also checks PR titles against Conventional Commits. Use `feat`, `fix`, `docs`, `style`,
`refactor`, `perf`, `test`, `build`, or `revert` with a `(shared)`, `(sdk)`, or `(ui)` scope;
`ci:`, `chore:`, and `docs:` may be scopeless. Breaking changes may use `!` before the colon.
Examples: `feat(shared): add amount parser` and `ci: update dependency checks`.

## Making a change

1. **Find or open an issue.** Browse [`good first issue`](https://github.com/lumio-network/lumio-sdk/labels/good%20first%20issue)
   and [`help wanted`](https://github.com/lumio-network/lumio-sdk/labels/help%20wanted). Comment on
   the one you'd like to take so we can assign it and avoid duplicate work.
2. **Branch** off `main` (e.g. `fix/parse-amount-validation`).
3. **Keep it focused.** One issue per PR; add or update tests for the behaviour you change.
4. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/) — matching the
   existing history and issue titles, e.g. `fix(shared): reject malformed parseAmount input`.
5. **Open the PR** against `main`, link the issue (`Closes #123`), and describe what changed and
   how you verified it. Fill in the acceptance-criteria checklist from the issue.

## Reporting a bug or proposing work

Open an issue with a clear title, a minimal reproduction (input → actual vs. expected output for
utility bugs), and the affected package/file. Well-scoped, evidence-backed issues get picked up
fastest.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md).
By participating you are expected to uphold it.

## License

By contributing you agree that your contributions are licensed under the project's
[Apache-2.0](./LICENSE) license.
