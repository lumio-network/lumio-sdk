# lumio-sdk

**The connective layer.** TypeScript packages that glue Lumio's on-chain
[contracts](https://github.com/lumio-network/lumio-contracts) to its
[apps](https://github.com/lumio-network/lumio-app): a contract client, a shared UI component
library, and common types.

Part of [Lumio](https://github.com/lumio-network) — an open-source cooperative finance platform.

## Packages

| Package        | Name             | Responsibility                                                             |
| -------------- | ---------------- | -------------------------------------------------------------------------- |
| `packages/shared` | `@lumio/shared` | Shared types + utils used by `sdk`, `ui`, and every `lumio-app` package. · [README](./packages/shared/README.md) |
| `packages/sdk`    | `@lumio/sdk`    | Contract client — one module per Soroban contract, wrapping RPC calls. · [README](./packages/sdk/README.md)     |
| `packages/ui`     | `@lumio/ui`     | Shared component library + design tokens (the "Ledger of Light" system). · [README](./packages/ui/README.md)    |

`sdk` and `ui` depend on `shared`. All three are consumed by `lumio-app`.

> ⚠️ **Scaffold.** The `sdk` clients currently **stub** their RPC calls (they throw
> `NotImplementedError` or return typed mock data). Wiring them to the real deployed contracts
> is a later phase.

## Requirements

- Node.js ≥ 20
- pnpm 9.12 (`corepack enable` or `npm i -g pnpm@9.12.0`)

## Getting started

```bash
pnpm install
pnpm build       # builds shared → sdk/ui (respects dependency order)
pnpm test        # vitest
pnpm lint        # eslint
pnpm typecheck   # tsc --noEmit per package
```

## Design tokens

`@lumio/ui` ships the finalized brand foundation v1.0:

- `packages/ui/src/tokens/design-tokens.css` — CSS custom properties (import once at your app root).
- `packages/ui/src/tailwind.preset.ts` — a Tailwind preset mapping utilities to those properties
  (imported by apps as `@lumio/ui/tailwind-preset`).

Consuming apps import the CSS for the raw variables and extend the Tailwind preset so utilities
like `bg-ink`, `text-lumen`, and `font-display` resolve to the brand values. See the `lumio-app`
dashboard/admin for a worked example.

**Accessibility rule (enforced by convention):** on a Paper (light) background use only the
`*-on-light` or `*-dim` accent variants for text; the bright accents are for dark backgrounds or
large graphics (≥ 24px / 3:1). Never use raw `--lumio-lumen` as text on Paper.

## Layout

```
lumio-sdk/
├── packages/
│   ├── shared/   # @lumio/shared — types + utils
│   ├── sdk/      # @lumio/sdk — treasury/governance/dividends/voting clients
│   └── ui/       # @lumio/ui — tokens, Tailwind preset, Button/Card/Badge/Input
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── .github/workflows/ci.yml
```

## Publishing

The three packages publish to npm under the `@lumio` scope, versioned together via
[Changesets](https://github.com/changesets/changesets). See [`PUBLISHING.md`](./PUBLISHING.md) for
the release runbook. (Not yet published — the release pipeline is prepared and inert until an
`NPM_TOKEN` secret is set.)

## License

[Apache-2.0](./LICENSE).
