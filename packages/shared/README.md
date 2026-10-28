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

## Types

The package exports shared domain types describing the core Lumio platform entities and their lifecycle states.

### Primitive Types

- **`Address`** — A Stellar account or contract address in string form (`"G…"` / `"C…"`).
- **`Amount`** — A signed on-chain integer amount carried as `bigint` off-chain to avoid floating-point loss. Stellar amounts use 7 decimal places.

### Contract and Network Types

- **`ContractName`** — One of `"treasury"`, `"governance"`, `"dividends"`, or `"voting"` — the four Lumio contracts the SDK talks to.
- **`NetworkName`** — One of `"testnet"`, `"futurenet"`, or `"mainnet"` — the supported Stellar networks.
- **`NetworkConfig`** — Connection details for a Stellar/Soroban network:

```ts
interface NetworkConfig {
  rpcUrl: string;
  networkPassphrase: string;
}
```

### Governance and Voting Types

- **`ProposalStatus`** — One of `"open"`, `"passed"`, `"rejected"`, or `"executed"` — the four lifecycle states a proposal can reach.
- **`VoteChoice`** — One of `"yes"`, `"no"`, or `"abstain"` — the three possible vote choices a member can cast on a proposal.

- **`Proposal`** — A governance proposal the group votes on:

```ts
interface Proposal {
  id: number;
  proposer: Address;
  title: string;
  status: ProposalStatus;
  createdAt: string; // ISO-8601 timestamp
}
```

- **`Vote`** — A vote cast by a member on a proposal:

```ts
interface Vote {
  proposalId: number;
  voter: Address;
  choice: VoteChoice;
}
```

- **`Tally`** — Aggregated vote counts for a proposal:

```ts
interface Tally {
  yes: number;
  no: number;
  abstain: number;
}
```

### Treasury and Member Types

- **`Member`** — A member of a savings group / cooperative:

```ts
interface Member {
  address: Address;
  displayName?: string;
  joinedAt: string; // ISO-8601 timestamp
}
```

- **`Contribution`** — A single contribution paid into the treasury during a cycle:

```ts
interface Contribution {
  member: Address;
  amount: Amount;
  cycle: number; // 1-based rotation cycle
  at: string; // ISO-8601 timestamp
}
```

- **`Dividend`** — A payout share owed to a member for a given cycle:

```ts
interface Dividend {
  member: Address;
  share: Amount;
  cycle: number;
}
```

### Constants

- **`CONTRACT_NAMES`** — Array of the four contract names: `["treasury", "governance", "dividends", "voting"]`.
- **`PROPOSAL_STATUSES`** — Array of the four proposal statuses: `["open", "passed", "rejected", "executed"]`.
- **`VOTE_CHOICES`** — Array of the three vote choices: `["yes", "no", "abstain"]`.
- **`NETWORKS`** — Well-known Stellar networks configuration object with `testnet`, `futurenet`, and `mainnet`.
- **`NETWORK_NAMES`** — Array of network names: `["testnet", "futurenet", "mainnet"]`.

## Utilities

The package exports a set of pure helpers beside the shared domain types.

### `STELLAR_DECIMALS`

```ts
import { STELLAR_DECIMALS } from "@lumio/shared";

STELLAR_DECIMALS; // 7
```

### `truncateAddress(address, visible)`

```ts
import { truncateAddress } from "@lumio/shared";

truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ", 4); // "GABC…WXYZ"
```

### `formatAmount(amount, decimals?)`

```ts
import { formatAmount } from "@lumio/shared";

formatAmount(12_500_000n); // "1.25"
```

### `formatAmountFixed(amount, fractionDigits, decimals?)`

```ts
import { formatAmountFixed } from "@lumio/shared";

formatAmountFixed(15_000_000n, 2); // "1.50"
```

### `parseAmount(value, decimals?)`

```ts
import { parseAmount, InvalidAmountError } from "@lumio/shared";

parseAmount("1.25"); // 12_500_000n

try {
  parseAmount("1.23456789");
} catch (error) {
  if (error instanceof InvalidAmountError) {
    console.error(error.message); // Invalid amount "1.23456789"
  }
}
```

### `tryParseAmount(value, decimals?)`

```ts
import { tryParseAmount } from "@lumio/shared";

const parsed = tryParseAmount("1.25");
if (parsed.ok) {
  console.log(parsed.value); // 12500000n
}
```

### `approvalRate(yes, no, decimalPlaces?)`

```ts
import { approvalRate } from "@lumio/shared";

approvalRate(3, 1); // 75
```

`approvalRate()` excludes abstentions from the denominator, so only decisive yes/no votes are counted.

### `approvalRateOf(tally)`

```ts
import { approvalRateOf } from "@lumio/shared";

approvalRateOf({ yes: 3, no: 1, abstain: 2 }); // 75
```

### `tallyTotal(tally)`

```ts
import { tallyTotal } from "@lumio/shared";

tallyTotal({ yes: 3, no: 1, abstain: 2 }); // 6
```

### `getNetwork(name)` / `getNetworkByPassphrase(passphrase)`

```ts
import { getNetwork, getNetworkByPassphrase } from "@lumio/shared";

getNetwork("testnet").rpcUrl; // "https://soroban-testnet.stellar.org"
getNetworkByPassphrase("Test SDF Network ; September 2015")?.rpcUrl;
```

### `isOpen(status)` / `isTerminal(status)`

```ts
import { isOpen, isTerminal } from "@lumio/shared";

isOpen("open"); // true
isTerminal("passed"); // true
```

### `isValidAddress(value)` / `isContractId(value)` / `isPublicKey(value)`

```ts
import { isValidAddress, isContractId, isPublicKey } from "@lumio/shared";

isValidAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ234567"); // true
isContractId("CABCDEFGHIJKLMNOPQRSTUVWXYZ234567"); // true
isPublicKey("GABCDEFGHIJKLMNOPQRSTUVWXYZ234567"); // true
```

These checks are shape-only validations. They confirm the string looks like a Stellar strkey, but do not verify the checksum or whether the address exists on-chain.

### `assertValidAddress(value, label?)`

```ts
import { assertValidAddress } from "@lumio/shared";

assertValidAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ234567", "member");
```

### `InvalidAmountError` / `InvalidAddressError`

```ts
import { InvalidAmountError, InvalidAddressError } from "@lumio/shared";
```

These error classes are thrown by the validation helpers and amount parsing utilities when a value does not match the expected Stellar format.

## License

[Apache-2.0](./LICENSE). Part of the [lumio-sdk](https://github.com/lumio-network/lumio-sdk) monorepo.
