import { describe, expect, it } from "vitest";
import { NETWORKS } from "@lumio/shared";
import { LumioClient, NotImplementedError, type ContractIds } from "./index";

const contractIds: ContractIds = {
  treasury: "CTREASURY000000000000000000000000000000000000000000000000",
  governance: "CGOVERNANCE0000000000000000000000000000000000000000000000",
  dividends: "CDIVIDENDS00000000000000000000000000000000000000000000000",
  voting: "CVOTING0000000000000000000000000000000000000000000000000",
};

function makeClient(): LumioClient {
  return new LumioClient({ network: NETWORKS.testnet, contractIds });
}

describe("LumioClient", () => {
  it("wires each contract client with its id and the shared network", () => {
    const lumio = makeClient();
    expect(lumio.treasury.contractId).toBe(contractIds.treasury);
    expect(lumio.governance.contractId).toBe(contractIds.governance);
    expect(lumio.dividends.contractId).toBe(contractIds.dividends);
    expect(lumio.voting.contractId).toBe(contractIds.voting);
    expect(lumio.treasury.network).toBe(NETWORKS.testnet);
  });

  it("returns typed mock data for read methods", async () => {
    const lumio = makeClient();
    expect(await lumio.treasury.total()).toBe(0n);
    expect(await lumio.treasury.balanceOf(contractIds.treasury)).toBe(0n);
    expect(await lumio.governance.proposalCount()).toBe(0);
    expect(await lumio.governance.getProposal(1)).toBeNull();
    expect(await lumio.dividends.pool()).toBe(0n);
    expect(await lumio.dividends.listShares()).toEqual([]);
    expect(await lumio.voting.tally(1)).toEqual({ yes: 0, no: 0, abstain: 0 });
  });

  it("throws NotImplementedError for state-changing methods", async () => {
    const lumio = makeClient();
    await expect(lumio.treasury.deposit(contractIds.treasury, 1n)).rejects.toBeInstanceOf(
      NotImplementedError,
    );
    await expect(
      lumio.governance.createProposal(contractIds.governance, "Raise dues"),
    ).rejects.toBeInstanceOf(NotImplementedError);
    await expect(lumio.dividends.fund(1n)).rejects.toBeInstanceOf(NotImplementedError);
    await expect(lumio.voting.castVote(1, contractIds.voting, "yes")).rejects.toBeInstanceOf(
      NotImplementedError,
    );
  });
});
