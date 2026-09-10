# @lumio/shared

Shared domain types and pure utilities for the [Lumio](https://github.com/lumio-network)
cooperative-finance platform. Consumed by [`@lumio/sdk`](https://www.npmjs.com/package/@lumio/sdk),
[`@lumio/ui`](https://www.npmjs.com/package/@lumio/ui), and every `lumio-app` package.

## Install

```bash
pnpm add @lumio/shared
```

## Usage

```ts
import { truncateAddress, formatAmount, parseAmount } from "@lumio/shared";

truncateAddress("GABCDEFG...WXYZ");   // "GABC…WXYZ"
formatAmount(12_500_000n);            // "1.25"  (7-decimal Stellar amounts)
parseAmount("1.25");                  // 12500000n
```

Also exports the core domain types — `Member`, `Contribution`, `Proposal`, `Vote`, `Dividend`,
`Address`, `Amount`, `ContractName`, `NetworkConfig` — plus the `STELLAR_DECIMALS` constant.

## License

[Apache-2.0](./LICENSE). Part of the [lumio-sdk](https://github.com/lumio-network/lumio-sdk) monorepo.
