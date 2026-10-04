import { describe, it, expect } from "vitest";
import * as shared from "./index";
import {
  truncateAddress,
  formatAmount,
  formatAmountFixed,
  parseAmount,
  tryParseAmount,
  approvalRate,
  approvalRateOf,
  emptyTally,
  tallyTotal,
  getNetwork,
  getNetworkByPassphrase,
  isOpen,
  isTerminal,
  isValidAddress,
  isContractId,
  isPublicKey,
  assertValidAddress,
  InvalidAmountError,
  InvalidAddressError,
} from "./utils";
import { CONTRACT_NAMES, NETWORKS } from "./types";
import type { ProposalStatus } from "./types";
import type { Tally } from "./types";

describe("public export surface", () => {
  it("matches the documented shared API surface", () => {
    expect(Object.keys(shared).sort()).toEqual([
      "CONTRACT_NAMES",
      "InvalidAddressError",
      "InvalidAmountError",
      "NETWORKS",
      "STELLAR_DECIMALS",
      "approvalRate",
      "approvalRateOf",
      "assertValidAddress",
      "emptyTally",
      "formatAmount",
      "formatAmountFixed",
      "getNetwork",
      "getNetworkByPassphrase",
      "isContractId",
      "isOpen",
      "isPublicKey",
      "isTerminal",
      "isValidAddress",
      "parseAmount",
      "tallyTotal",
      "truncateAddress",
      "tryParseAmount",
    ]);
  });
});

describe("truncateAddress", () => {
  it("shortens long addresses with an ellipsis", () => {
    expect(truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ", 4)).toBe("GABC…WXYZ");
  });

  it("leaves short addresses untouched", () => {
    expect(truncateAddress("GABC", 4)).toBe("GABC");
  });

  it("throws RangeError for visible = 0 (slice(-0) bug)", () => {
    expect(() => truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ", 0)).toThrow(RangeError);
    expect(() => truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ", 0)).toThrow(
      "visible must be a positive integer",
    );
  });

  it("throws RangeError for negative visible", () => {
    expect(() => truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ", -2)).toThrow(RangeError);
    expect(() => truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ", -2)).toThrow(
      "visible must be a positive integer",
    );
  });

  it("throws RangeError for non-integer visible", () => {
    expect(() => truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ", 1.5)).toThrow(RangeError);
    expect(() => truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ", 1.5)).toThrow(
      "visible must be a positive integer",
    );
  });

  it("throws RangeError for non-finite visible (NaN / Infinity)", () => {
    expect(() => truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ", NaN)).toThrow(RangeError);
    expect(() => truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ", Infinity)).toThrow(RangeError);
  });

  it("never returns the full untruncated address when visible <= 0", () => {
    const addr = "GABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (const v of [0, -1, -2]) {
      expect(() => truncateAddress(addr, v)).toThrow(RangeError);
    }
  });
});

describe("formatAmount / parseAmount", () => {
  it("formats raw base units to a trimmed decimal string", () => {
    expect(formatAmount(12_500_000n)).toBe("1.25");
    expect(formatAmount(10_000_000n)).toBe("1");
    expect(formatAmount(0n)).toBe("0");
    expect(formatAmount(-12_500_000n)).toBe("-1.25");
  });

  it("round-trips through parseAmount", () => {
    for (const value of ["0", "1", "1.25", "0.0000001", "1234.5678901"]) {
      expect(formatAmount(parseAmount(value))).toBe(value);
    }
  });

  it("keeps trimmed formatting by default and pads fixed precision on request", () => {
    expect(formatAmount(15_000_000n)).toBe("1.5");
    expect(formatAmountFixed(15_000_000n, 2)).toBe("1.50");
    expect(formatAmountFixed(15_000_000n, 3, 7)).toBe("1.500");
  });

  it("rounds fixed precision using integer arithmetic", () => {
    expect(formatAmountFixed(12_550_000n, 1)).toBe("1.3");
    expect(formatAmountFixed(-12_550_000n, 1)).toBe("-1.3");
    expect(formatAmountFixed(99_999_999n, 2)).toBe("10.00");
    expect(formatAmountFixed(15_000_000n, 0)).toBe("2");
  });

  it("rejects invalid decimal counts in both conversion functions", () => {
    for (const decimals of [-1, 1.5, NaN, Infinity]) {
      expect(() => formatAmount(1n, decimals)).toThrow(RangeError);
      expect(() => formatAmount(1n, decimals)).toThrow(
        "decimals must be a non-negative safe integer",
      );
      expect(() => parseAmount("1", decimals)).toThrow(RangeError);
      expect(() => parseAmount("1", decimals)).toThrow(
        "decimals must be a non-negative safe integer",
      );
    }
  });

  describe("parseAmount — malformed / over-precise input", () => {
    it("rejects over-precise input (more fractional digits than decimals)", () => {
      expect(() => parseAmount("0.123456789")).toThrow(InvalidAmountError);
      expect(() => parseAmount("0.123456789")).toThrow('Invalid amount "0.123456789"');
    });

    it("rejects multiple dots", () => {
      expect(() => parseAmount("1.2.3")).toThrow(InvalidAmountError);
      expect(() => parseAmount("1.2.3")).toThrow('Invalid amount "1.2.3"');
    });

    it("rejects empty string", () => {
      expect(() => parseAmount("")).toThrow(InvalidAmountError);
      expect(() => parseAmount("")).toThrow('Invalid amount ""');
    });

    it("rejects whitespace-only string", () => {
      expect(() => parseAmount(" ")).toThrow(InvalidAmountError);
      expect(() => parseAmount(" ")).toThrow('Invalid amount " "');
    });

    it("rejects non-numeric strings", () => {
      expect(() => parseAmount("abc")).toThrow(InvalidAmountError);
      expect(() => parseAmount("abc")).toThrow('Invalid amount "abc"');
    });

    it("rejects scientific notation", () => {
      expect(() => parseAmount("1e3")).toThrow(InvalidAmountError);
      expect(() => parseAmount("1e3")).toThrow('Invalid amount "1e3"');
    });

    it("rejects underscore-separated numbers", () => {
      expect(() => parseAmount("1_000")).toThrow(InvalidAmountError);
      expect(() => parseAmount("1_000")).toThrow('Invalid amount "1_000"');
    });

    it("rejects currency-prefixed strings", () => {
      expect(() => parseAmount("$5")).toThrow(InvalidAmountError);
      expect(() => parseAmount("$5")).toThrow('Invalid amount "$5"');
    });

    it("does not throw a raw SyntaxError for any malformed input", () => {
      const malformed = ["abc", "1e3", "1_000", "$5", "", " ", "1.2.3", "0.123456789"];
      for (const bad of malformed) {
        let caught: unknown;
        try {
          parseAmount(bad);
        } catch (e) {
          caught = e;
        }
        expect(caught).toBeInstanceOf(InvalidAmountError);
      }
    });
  });
});

describe("tryParseAmount", () => {
  it("returns parsed amounts in a success result", () => {
    expect(tryParseAmount("1.25")).toEqual({ ok: true, value: parseAmount("1.25") });
    expect(tryParseAmount("1.25", 2)).toEqual({ ok: true, value: parseAmount("1.25", 2) });
  });

  it("returns errors for malformed and over-precise inputs without throwing", () => {
    const malformed = ["abc", "1e3", "1_000", "$5", "", " ", "1.2.3", "0.123456789"];
    for (const value of malformed) {
      expect(tryParseAmount(value)).toEqual({
        ok: false,
        error: `Invalid amount "${value}"`,
      });
    }
  });
});

describe("approvalRate", () => {
  it("computes the yes share of decisive votes", () => {
    expect(approvalRate(3, 1)).toBe(75);
    expect(approvalRate(0, 0)).toBe(0);
    expect(approvalRate(1, 2)).toBe(33.3);
  });

  it("throws RangeError for negative yes", () => {
    expect(() => approvalRate(-1, 3)).toThrow(RangeError);
    expect(() => approvalRate(-1, 3)).toThrow("yes must be a non-negative finite number");
  });

  it("throws RangeError for negative no", () => {
    expect(() => approvalRate(3, -1)).toThrow(RangeError);
    expect(() => approvalRate(3, -1)).toThrow("no must be a non-negative finite number");
  });

  it("throws RangeError for NaN yes", () => {
    expect(() => approvalRate(NaN, 1)).toThrow(RangeError);
    expect(() => approvalRate(NaN, 1)).toThrow("yes must be a non-negative finite number");
  });

  it("throws RangeError for NaN no", () => {
    expect(() => approvalRate(1, NaN)).toThrow(RangeError);
    expect(() => approvalRate(1, NaN)).toThrow("no must be a non-negative finite number");
  });

  it("throws RangeError for Infinity inputs", () => {
    expect(() => approvalRate(Infinity, 1)).toThrow(RangeError);
    expect(() => approvalRate(1, Infinity)).toThrow(RangeError);
  });

  it("never returns a value outside 0–100 for valid inputs", () => {
    expect(approvalRate(0, 5)).toBe(0);
    expect(approvalRate(5, 0)).toBe(100);
    expect(approvalRate(3, 1)).toBe(75);
  });
});

describe("proposal status helpers", () => {
  const statuses: ProposalStatus[] = ["open", "passed", "rejected", "executed"];

  it("identifies only open proposals as open", () => {
    expect(statuses.map(isOpen)).toEqual([true, false, false, false]);
  });

  it("identifies every completed status as terminal", () => {
    expect(statuses.map(isTerminal)).toEqual([false, true, true, true]);
  });
});

describe("CONTRACT_NAMES", () => {
  it("contains exactly the supported contract names", () => {
    expect(CONTRACT_NAMES).toEqual(["treasury", "governance", "dividends", "voting"]);
  });
});

describe("emptyTally", () => {
  it("returns a zeroed tally", () => {
    expect(emptyTally()).toEqual({
      yes: 0,
      no: 0,
      abstain: 0,
    });
  });

  it("totals to zero via tallyTotal", () => {
    expect(tallyTotal(emptyTally())).toBe(0);
  });

  it("returns a fresh object on every call", () => {
    const first = emptyTally();
    const second = emptyTally();

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });
});

describe("tallyTotal / approvalRateOf", () => {
  const tally: Tally = { yes: 3, no: 1, abstain: 2 };

  it("totals all votes including abstentions", () => {
    expect(tallyTotal(tally)).toBe(6);
  });

  it("delegates approval rate to decisive yes/no votes", () => {
    expect(approvalRateOf(tally)).toBe(approvalRate(tally.yes, tally.no));
    expect(approvalRateOf(tally)).toBe(75);
    expect(approvalRateOf({ yes: 0, no: 0, abstain: 4 })).toBe(0);
  });

  it("inherits approvalRate input validation", () => {
    expect(() => approvalRateOf({ yes: -1, no: 0, abstain: 0 })).toThrow(RangeError);
  });
});

describe("getNetwork", () => {
  it("returns the matching NetworkConfig for testnet", () => {
    const config = getNetwork("testnet");
    expect(config.rpcUrl).toBe("https://soroban-testnet.stellar.org");
    expect(config.networkPassphrase).toBe("Test SDF Network ; September 2015");
  });

  it("returns the matching NetworkConfig for futurenet", () => {
    const config = getNetwork("futurenet");
    expect(config.rpcUrl).toBe("https://rpc-futurenet.stellar.org");
  });

  it("returns the matching NetworkConfig for mainnet", () => {
    const config = getNetwork("mainnet");
    expect(config.rpcUrl).toBe("https://mainnet.sorobanrpc.com");
  });

  it("returns the same object reference as NETWORKS[name]", () => {
    expect(getNetwork("testnet")).toBe(NETWORKS.testnet);
    expect(getNetwork("mainnet")).toBe(NETWORKS.mainnet);
  });

  it("resolves each known network by passphrase", () => {
    for (const network of Object.values(NETWORKS)) {
      expect(getNetworkByPassphrase(network.networkPassphrase)).toBe(network);
    }
  });

  it("returns undefined for an unknown passphrase", () => {
    expect(getNetworkByPassphrase("unknown passphrase")).toBeUndefined();
  });
});

describe("isValidAddress", () => {
  it("accepts a well-formed G... public key (56 chars, base32)", () => {
    expect(isValidAddress("GABC2DEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV")).toBe(true);
  });

  it("accepts a well-formed C... contract id (56 chars, base32)", () => {
    expect(isValidAddress("CTREASURY000000000000000000000000000000000000000000000000")).toBe(false); // 0 not base32
    expect(isValidAddress("CTREASURYBCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOP")).toBe(true);
  });

  it("rejects an address that is too short", () => {
    expect(isValidAddress("GABCDE")).toBe(false);
  });

  it("rejects an address that is too long", () => {
    expect(isValidAddress("G" + "A".repeat(56))).toBe(false);
  });

  it("rejects an address starting with an invalid prefix", () => {
    expect(isValidAddress("XABC2DEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV")).toBe(false);
    expect(isValidAddress("SABC2DEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV")).toBe(false);
  });

  it("rejects an address containing non-base32 characters", () => {
    // '0', '1', '8', '9' are not valid base32 chars
    expect(isValidAddress("G0BC2DEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV")).toBe(false);
    expect(isValidAddress("GABC2DEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTU1")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidAddress("")).toBe(false);
  });
});

describe("isContractId / isPublicKey", () => {
  const publicKey = "GABC2DEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV";
  const contractId = "CTREASURYBCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOP";

  it("accepts only the matching address kind", () => {
    expect(isPublicKey(publicKey)).toBe(true);
    expect(isPublicKey(contractId)).toBe(false);
    expect(isContractId(contractId)).toBe(true);
    expect(isContractId(publicKey)).toBe(false);
  });

  it("rejects wrong-length and non-base32 values", () => {
    expect(isPublicKey("GABC")).toBe(false);
    expect(isPublicKey(`G${"0".repeat(55)}`)).toBe(false);
    expect(isContractId("CABC")).toBe(false);
    expect(isContractId(`C${"0".repeat(55)}`)).toBe(false);
  });
});

describe("assertValidAddress", () => {
  const publicKey = "GABC2DEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV";

  it("accepts a valid address", () => {
    expect(() => assertValidAddress(publicKey)).not.toThrow();
  });

  it("throws InvalidAddressError with the optional label", () => {
    expect(() => assertValidAddress("invalid")).toThrow(InvalidAddressError);
    expect(() => assertValidAddress("invalid", "recipient")).toThrow(
      'Invalid recipient address "invalid"',
    );
  });
});
