import type { Address, Amount } from "@lumio/shared";
import { ContractClient } from "./client";
import { NotImplementedError } from "./errors";

/**
 * Client for the `treasury` contract — the pooled group vault.
 *
 * Mirrors the contract's entrypoints: `deposit`, `balance`, `total`.
 */
export class TreasuryClient extends ContractClient {
  /** Record a contribution of `amount` from `member` (needs signing — not wired yet). */
  async deposit(_member: Address, _amount: Amount): Promise<void> {
    throw new NotImplementedError("TreasuryClient.deposit");
  }

  /** The amount `member` has contributed so far. Mock `0n` until RPC is wired. */
  async balanceOf(_member: Address): Promise<Amount> {
    return 0n;
  }

  /** The total pooled across all members. Mock `0n` until RPC is wired. */
  async total(): Promise<Amount> {
    return 0n;
  }
}
