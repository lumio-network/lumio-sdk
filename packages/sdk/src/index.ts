/**
 * `@lumio/sdk` — typed clients for the four Lumio Soroban contracts.
 *
 * Scaffold phase: read methods return typed mock data so apps can render real
 * UI, and state-changing methods throw {@link NotImplementedError}. The Soroban
 * RPC transport and transaction assembly land in a later phase.
 */

// Re-export the shared domain types so app code can import everything from the SDK.
export * from "@lumio/shared";

export { ContractClient, type ClientOptions } from "./client";
export { NotImplementedError } from "./errors";

export { TreasuryClient } from "./treasury";
export { GovernanceClient } from "./governance";
export { DividendsClient } from "./dividends";
export { VotingClient } from "./voting";

export { LumioClient, type ContractIds, type LumioClientOptions } from "./lumio-client";
