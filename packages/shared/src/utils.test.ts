import { describe, it, expect } from "vitest";
import {
  truncateAddress,
  formatAmount,
  parseAmount,
  approvalRate,
  InvalidAmountError,
} from "./utils";

describe("truncateAddress", () => {
  it("shortens long addresses with an ellipsis", () => {
    expect(truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ", 4)).toBe("GABC…WXYZ");
  });

  it("leaves short addresses untouched", () => {
    expect(truncateAddress("GABC", 4)).toBe("GABC");
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
});
