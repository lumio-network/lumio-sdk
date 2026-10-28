import { describe, expect, it } from "vitest";
import { InvalidAddressError, NETWORKS } from "@lumio/shared";
import * as sdk from "./index";
import {
  DividendsClient,
  GovernanceClient,
  LumioClient,
  NotImplementedError,
  TreasuryClient,
  VotingClient,
  type ContractIds,
} from "./index";

const contractIds: ContractIds = {
  treasury: "C" + "A".repeat(55),
  governance: "C" + "B".repeat(55),
  dividends: "C" + "C".repeat(55),
  voting: "C" + "D".repeat(55),
};

function makeClient(): LumioClient {
  return new LumioClient({ network: NETWORKS.testnet, contractIds });
}

describe("public export surface", () => {
  it("exports SDK-specific classes and types", () => {
    const sdkKeys = Object.keys(sdk).sort();

    // SDK's own named exports
    expect(sdkKeys).toContain("ContractClient");
    expect(sdkKeys).toContain("NotImplementedError");
    expect(sdkKeys).toContain("TreasuryClient");
    expect(sdkKeys).toContain("GovernanceClient");
    expect(sdkKeys).toContain("DividendsClient");
    expect(sdkKeys).toContain("VotingClient");
    expect(sdkKeys).toContain("LumioClient");
  });

  it("re-exports key symbols from @lumio/shared", () => {
    const sdkKeys = Object.keys(sdk).sort();

    // Representative shared symbols (constants, types, utilities, errors)
    expect(sdkKeys).toContain("NETWORKS");
    expect(sdkKeys).toContain("NETWORK_NAMES");
    expect(sdkKeys).toContain("CONTRACT_NAMES");
    expect(sdkKeys).toContain("PROPOSAL_STATUSES");
    expect(sdkKeys).toContain("VOTE_CHOICES");
    expect(sdkKeys).toContain("STELLAR_DECIMALS");
    expect(sdkKeys).toContain("formatAmount");
    expect(sdkKeys).toContain("formatAmountFixed");
    expect(sdkKeys).toContain("parseAmount");
    expect(sdkKeys).toContain("tryParseAmount");
    expect(sdkKeys).toContain("isValidAddress");
    expect(sdkKeys).toContain("isContractId");
    expect(sdkKeys).toContain("isPublicKey");
    expect(sdkKeys).toContain("assertValidAddress");
    expect(sdkKeys).toContain("truncateAddress");
    expect(sdkKeys).toContain("approvalRate");
    expect(sdkKeys).toContain("approvalRateOf");
    expect(sdkKeys).toContain("tallyTotal");
    expect(sdkKeys).toContain("emptyTally");
    expect(sdkKeys).toContain("getNetwork");
    expect(sdkKeys).toContain("getNetworkByPassphrase");
    expect(sdkKeys).toContain("isNetworkName");
    expect(sdkKeys).toContain("isContractName");
    expect(sdkKeys).toContain("isProposalStatus");
    expect(sdkKeys).toContain("isVoteChoice");
    expect(sdkKeys).toContain("isOpen");
    expect(sdkKeys).toContain("isTerminal");
    expect(sdkKeys).toContain("InvalidAmountError");
    expect(sdkKeys).toContain("InvalidAddressError");
  });
});

describe("LumioClient", () => {
  it("wires each contract client with its id and the shared network", () => {
    const lumio = makeClient();
    expect(lumio.treasury.contractId).toBe(contractIds.treasury);
    expect(lumio.governance.contractId).toBe(contractIds.governance);
    expect(lumio.dividends.contractId).toBe(contractIds.dividends);
    expect(lumio.voting.contractId).toBe(contractIds.voting);
    expect(lumio.treasury.network).toBe(NETWORKS.testnet);
    expect(lumio.contractIds).toEqual(contractIds);
    expect(Object.isFrozen(lumio.contractIds)).toBe(true);
  });

  it("stores an isolated, frozen copy of the contractIds input", () => {
    const mutableIds: ContractIds = { ...contractIds };
    const lumio = new LumioClient({ network: NETWORKS.testnet, contractIds: mutableIds });

    // The stored value must be a different reference than the caller's object.
    expect(lumio.contractIds).not.toBe(mutableIds);
    expect(lumio.contractIds).toEqual(contractIds);

    // Mutating the source after construction must not affect the stored copy.
    mutableIds.treasury = "C" + "E".repeat(55);
    mutableIds.governance = "C" + "F".repeat(55);

    expect(lumio.contractIds.treasury).toBe(contractIds.treasury);
    expect(lumio.contractIds.governance).toBe(contractIds.governance);
    expect(lumio.contractIds).toEqual(contractIds);
  });

  it("throws a contract-specific error when a contract id is invalid", () => {
    expect(
      () =>
        new LumioClient({
          network: NETWORKS.testnet,
          contractIds: {
            ...contractIds,
            treasury: "bad",
          },
        }),
    ).toThrow(/treasury/i);

    expect(
      () =>
        new LumioClient({
          network: NETWORKS.testnet,
          contractIds: {
            ...contractIds,
            treasury: "bad",
          },
        }),
    ).toThrow(InvalidAddressError);

    expect(
      () =>
        new LumioClient({
          network: NETWORKS.testnet,
          contractIds: { ...contractIds, treasury: "C" + "0".repeat(55) },
        }),
    ).toThrow(/treasury/i);

    expect(
      () =>
        new LumioClient({
          network: NETWORKS.testnet,
          contractIds: { ...contractIds, treasury: "C" + "0".repeat(55) },
        }),
    ).toThrow(InvalidAddressError);
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

describe("individual contract clients", () => {
  it("store the contract id and network passed to their constructors", () => {
    const treasury = new TreasuryClient({
      contractId: contractIds.treasury,
      network: NETWORKS.testnet,
    });
    const governance = new GovernanceClient({
      contractId: contractIds.governance,
      network: NETWORKS.testnet,
    });
    const dividends = new DividendsClient({
      contractId: contractIds.dividends,
      network: NETWORKS.testnet,
    });
    const voting = new VotingClient({
      contractId: contractIds.voting,
      network: NETWORKS.testnet,
    });

    expect(treasury.contractId).toBe(contractIds.treasury);
    expect(treasury.network).toBe(NETWORKS.testnet);
    expect(governance.contractId).toBe(contractIds.governance);
    expect(governance.network).toBe(NETWORKS.testnet);
    expect(dividends.contractId).toBe(contractIds.dividends);
    expect(dividends.network).toBe(NETWORKS.testnet);
    expect(voting.contractId).toBe(contractIds.voting);
    expect(voting.network).toBe(NETWORKS.testnet);
  });

  it("returns the documented mock values from every read method", async () => {
    const treasury = new TreasuryClient({
      contractId: contractIds.treasury,
      network: NETWORKS.testnet,
    });
    const governance = new GovernanceClient({
      contractId: contractIds.governance,
      network: NETWORKS.testnet,
    });
    const dividends = new DividendsClient({
      contractId: contractIds.dividends,
      network: NETWORKS.testnet,
    });
    const voting = new VotingClient({
      contractId: contractIds.voting,
      network: NETWORKS.testnet,
    });

    expect(await treasury.balanceOf(contractIds.treasury)).toBe(0n);
    expect(await treasury.total()).toBe(0n);
    expect(await governance.getProposal(1)).toBeNull();
    expect(await governance.proposalCount()).toBe(0);
    expect(await dividends.shareOf(contractIds.dividends)).toBe(0n);
    expect(await dividends.listShares()).toEqual([]);
    expect(await dividends.pool()).toBe(0n);
    expect(await voting.tally(1)).toEqual({ yes: 0, no: 0, abstain: 0 });
  });

  it("throws the existing NotImplementedError for every write method", async () => {
    const treasury = new TreasuryClient({
      contractId: contractIds.treasury,
      network: NETWORKS.testnet,
    });
    const governance = new GovernanceClient({
      contractId: contractIds.governance,
      network: NETWORKS.testnet,
    });
    const dividends = new DividendsClient({
      contractId: contractIds.dividends,
      network: NETWORKS.testnet,
    });
    const voting = new VotingClient({
      contractId: contractIds.voting,
      network: NETWORKS.testnet,
    });
    const expectNotImplemented = async (operation: Promise<unknown>, method: string) => {
      const error = await operation.catch((reason: unknown) => reason);
      expect(error).toBeInstanceOf(NotImplementedError);
      expect(error).toMatchObject({
        message: `${method} is not implemented yet — Soroban RPC wiring lands in a later phase.`,
      });
    };

    await expectNotImplemented(
      treasury.deposit(contractIds.treasury, 1n),
      "TreasuryClient.deposit",
    );
    await expectNotImplemented(
      governance.createProposal(contractIds.governance, "Raise dues"),
      "GovernanceClient.createProposal",
    );
    await expectNotImplemented(dividends.fund(1n), "DividendsClient.fund");
    await expectNotImplemented(
      voting.castVote(1, contractIds.voting, "yes"),
      "VotingClient.castVote",
    );
  });

  it("rejects invalid contract ids in TreasuryClient constructor", () => {
    expect(
      () =>
        new TreasuryClient({
          contractId: "bad",
          network: NETWORKS.testnet,
        }),
    ).toThrow(InvalidAddressError);
    expect(
      () =>
        new TreasuryClient({
          contractId: "bad",
          network: NETWORKS.testnet,
        }),
    ).toThrow(/treasury/i);

    expect(
      () =>
        new TreasuryClient({
          contractId: "C" + "0".repeat(55),
          network: NETWORKS.testnet,
        }),
    ).toThrow(InvalidAddressError);
    expect(
      () =>
        new TreasuryClient({
          contractId: "C" + "0".repeat(55),
          network: NETWORKS.testnet,
        }),
    ).toThrow(/treasury/i);
  });

  it("rejects invalid contract ids in GovernanceClient constructor", () => {
    expect(
      () =>
        new GovernanceClient({
          contractId: "bad",
          network: NETWORKS.testnet,
        }),
    ).toThrow(InvalidAddressError);
    expect(
      () =>
        new GovernanceClient({
          contractId: "bad",
          network: NETWORKS.testnet,
        }),
    ).toThrow(/governance/i);

    expect(
      () =>
        new GovernanceClient({
          contractId: "C" + "0".repeat(55),
          network: NETWORKS.testnet,
        }),
    ).toThrow(InvalidAddressError);
    expect(
      () =>
        new GovernanceClient({
          contractId: "C" + "0".repeat(55),
          network: NETWORKS.testnet,
        }),
    ).toThrow(/governance/i);
  });

  it("rejects invalid contract ids in DividendsClient constructor", () => {
    expect(
      () =>
        new DividendsClient({
          contractId: "bad",
          network: NETWORKS.testnet,
        }),
    ).toThrow(InvalidAddressError);
    expect(
      () =>
        new DividendsClient({
          contractId: "bad",
          network: NETWORKS.testnet,
        }),
    ).toThrow(/dividends/i);

    expect(
      () =>
        new DividendsClient({
          contractId: "C" + "0".repeat(55),
          network: NETWORKS.testnet,
        }),
    ).toThrow(InvalidAddressError);
    expect(
      () =>
        new DividendsClient({
          contractId: "C" + "0".repeat(55),
          network: NETWORKS.testnet,
        }),
    ).toThrow(/dividends/i);
  });

  it("rejects invalid contract ids in VotingClient constructor", () => {
    expect(
      () =>
        new VotingClient({
          contractId: "bad",
          network: NETWORKS.testnet,
        }),
    ).toThrow(InvalidAddressError);
    expect(
      () =>
        new VotingClient({
          contractId: "bad",
          network: NETWORKS.testnet,
        }),
    ).toThrow(/voting/i);

    expect(
      () =>
        new VotingClient({
          contractId: "C" + "0".repeat(55),
          network: NETWORKS.testnet,
        }),
    ).toThrow(InvalidAddressError);
    expect(
      () =>
        new VotingClient({
          contractId: "C" + "0".repeat(55),
          network: NETWORKS.testnet,
        }),
    ).toThrow(/voting/i);
  });
});
