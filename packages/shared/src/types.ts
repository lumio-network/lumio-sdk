/**
 * Shared domain types for the Lumio platform.
 *
 * These describe the *shapes* passed between contracts, the SDK, and the apps.
 * They are intentionally transport-agnostic — the SDK maps them to/from Soroban
 * types when RPC wiring lands in a later phase.
 */

/** A Stellar account or contract address in string form ("G…" / "C…"). */
export type Address = string;

/**
 * A signed on-chain integer amount, carried as a `bigint` off-chain to avoid
 * floating-point loss. Stellar amounts use 7 decimal places (see {@link formatAmount}).
 */
export type Amount = bigint;

/** The four Lumio contracts the SDK talks to. */
export type ContractName = "treasury" | "governance" | "dividends" | "voting";

/** A member of a savings group / cooperative. */
export interface Member {
  address: Address;
  displayName?: string;
  /** ISO-8601 timestamp of when the member joined the group. */
  joinedAt: string;
}

/** A single contribution paid into the treasury during a cycle. */
export interface Contribution {
  member: Address;
  amount: Amount;
  /** 1-based rotation cycle this contribution belongs to. */
  cycle: number;
  /** ISO-8601 timestamp. */
  at: string;
}

export type ProposalStatus = "open" | "passed" | "rejected" | "executed";

/** A governance proposal the group votes on. */
export interface Proposal {
  id: number;
  proposer: Address;
  title: string;
  status: ProposalStatus;
  /** ISO-8601 timestamp. */
  createdAt: string;
}

export type VoteChoice = "yes" | "no" | "abstain";

/** A vote cast by a member on a proposal. */
export interface Vote {
  proposalId: number;
  voter: Address;
  choice: VoteChoice;
}

/** Aggregated vote counts for a proposal. */
export interface Tally {
  yes: number;
  no: number;
  abstain: number;
}

/** A payout share owed to a member for a given cycle. */
export interface Dividend {
  member: Address;
  share: Amount;
  cycle: number;
}

/** Connection details for a Stellar/Soroban network. */
export interface NetworkConfig {
  rpcUrl: string;
  networkPassphrase: string;
}

/** Well-known Stellar networks. */
export const NETWORKS = {
  testnet: {
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
  },
  futurenet: {
    rpcUrl: "https://rpc-futurenet.stellar.org",
    networkPassphrase: "Test SDF Future Network ; October 2022",
  },
  mainnet: {
    rpcUrl: "https://mainnet.sorobanrpc.com",
    networkPassphrase: "Public Global Stellar Network ; September 2015",
  },
} as const satisfies Record<string, NetworkConfig>;

export type NetworkName = keyof typeof NETWORKS;
