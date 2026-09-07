import { describe, it, expect } from "vitest";
import { truncateAddress, formatAmount, parseAmount, approvalRate } from "./utils";

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
});

describe("approvalRate", () => {
  it("computes the yes share of decisive votes", () => {
    expect(approvalRate(3, 1)).toBe(75);
    expect(approvalRate(0, 0)).toBe(0);
    expect(approvalRate(1, 2)).toBe(33.3);
  });
});
