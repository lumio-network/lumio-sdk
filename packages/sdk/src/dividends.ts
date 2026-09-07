import type { Address, Amount, Dividend } from "@lumio/shared";
import { ContractClient } from "./client";
import { NotImplementedError } from "./errors";

/**
 * Client for the `dividends` contract — surplus distribution to members.
 *
 * Mirrors the contract's entrypoints: `fund`, `record_share`, `share_of`, `pool`.
 */
export class DividendsClient extends ContractClient {
  /** Add `amount` to the distributable pool (needs signing — not wired yet). */
  async fund(_amount: Amount): Promise<void> {
    throw new NotImplementedError("DividendsClient.fund");
  }

  /** The share owed to `member`. Mock `0n` until RPC is wired. */
  async shareOf(_member: Address): Promise<Amount> {
    return 0n;
  }

  /** Every recorded share. Mock `[]` until RPC is wired. */
  async listShares(): Promise<Dividend[]> {
    return [];
  }

  /** The total undistributed pool. Mock `0n` until RPC is wired. */
  async pool(): Promise<Amount> {
    return 0n;
  }
}
