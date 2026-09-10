import { describe, it, expect } from "vitest";
import {
  truncateAddress,
  formatAmount,
  parseAmount,
  approvalRate,
  getNetwork,
  isValidAddress,
  InvalidAmountError,
} from "./utils";
import { NETWORKS } from "./types";

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
