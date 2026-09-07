import type { Address, Tally, VoteChoice } from "@lumio/shared";
import { ContractClient } from "./client";
import { NotImplementedError } from "./errors";

/**
 * Client for the `voting` contract — tallying votes on a proposal.
 *
 * Mirrors the contract's entrypoints: `cast_vote`, `tally`.
 */
export class VotingClient extends ContractClient {
  /** Cast `voter`'s `choice` on a proposal (needs signing — not wired yet). */
  async castVote(_proposalId: number, _voter: Address, _choice: VoteChoice): Promise<void> {
    throw new NotImplementedError("VotingClient.castVote");
  }

  /** Aggregated counts for a proposal. Mock zeroed until RPC is wired. */
  async tally(_proposalId: number): Promise<Tally> {
    return { yes: 0, no: 0, abstain: 0 };
  }
}
