import type { Address, NetworkConfig } from "@lumio/shared";

/** Options every contract client is constructed with. */
export interface ClientOptions {
  /** The deployed contract id ("C…"). */
  contractId: Address;
  /** The network the contract lives on. */
  network: NetworkConfig;
}

/**
 * Base class for the per-contract clients. Holds the deployed contract id and
 * network config; subclasses add one method per contract entrypoint.
 *
 * Scaffold: no Soroban RPC transport is attached yet. A later phase will add a
 * shared `rpc.Server` (from `@stellar/stellar-sdk`) and transaction assembly here.
 */
export abstract class ContractClient {
  readonly contractId: Address;
  readonly network: NetworkConfig;

  constructor(options: ClientOptions) {
    this.contractId = options.contractId;
    this.network = options.network;
  }
}
