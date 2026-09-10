# @lumio/sdk

Typed clients for the four [Lumio](https://github.com/lumio-network) Soroban contracts —
treasury, governance, dividends, and voting.

> ⚠️ **Scaffold phase.** Read methods return typed mock data so apps can render real UI, and
> state-changing methods throw `NotImplementedError`. The Soroban RPC transport and transaction
> assembly land in a later phase.

## Install

```bash
pnpm add @lumio/sdk
```

`@lumio/shared` is a dependency and installs automatically.

## Usage

```ts
import { LumioClient } from "@lumio/sdk";

const lumio = new LumioClient({ network, contractIds });
const total = await lumio.treasury.total();
```

Individual clients (`TreasuryClient`, `GovernanceClient`, `DividendsClient`, `VotingClient`) are
also exported, along with `ContractClient`, `NotImplementedError`, and every type from
[`@lumio/shared`](https://www.npmjs.com/package/@lumio/shared).

## License

[Apache-2.0](./LICENSE). Part of the [lumio-sdk](https://github.com/lumio-network/lumio-sdk) monorepo.
