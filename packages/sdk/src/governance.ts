import type { Address, Proposal } from "@lumio/shared";
import { ContractClient } from "./client";
import { NotImplementedError } from "./errors";

/**
 * Client for the `governance` contract — proposals and voting rules.
 *
 * Mirrors the contract's entrypoints: `create_proposal`, `get_proposal`,
 * `proposal_count`.
 */
export class GovernanceClient extends ContractClient {
  /** Create a proposal authored by `proposer` (needs signing — not wired yet). */
  async createProposal(_proposer: Address, _title: string): Promise<number> {
    throw new NotImplementedError("GovernanceClient.createProposal");
  }

  /** Fetch a proposal by id. Mock `null` until RPC is wired. */
  async getProposal(_id: number): Promise<Proposal | null> {
    return null;
  }

  /** How many proposals exist. Mock `0` until RPC is wired. */
  async proposalCount(): Promise<number> {
    return 0;
  }
}
