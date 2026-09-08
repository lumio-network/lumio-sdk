import type { Address, Amount } from "./types";

/** Number of decimal places Stellar uses for native amounts. */
export const STELLAR_DECIMALS = 7;

/**
 * Shorten an address for display, e.g. `truncateAddress("GABC…", 4)` → `"GABC…WXYZ"`.
 * Returns the address unchanged if it is already short enough.
 */
export function truncateAddress(address: Address, visible = 4): string {
  if (visible <= 0) return address;
  if (address.length <= visible * 2 + 1) return address;
  return address.slice(0, visible) + "\u2026" + address.slice(-visible);
}

/**
 * Format a raw on-chain integer amount as a human decimal string.
 * Trailing zeros in the fractional part are trimmed.
 *
 * @example formatAmount(12_500_000n) // "1.25"
 */
export function formatAmount(amount: Amount, decimals = STELLAR_DECIMALS): string {
  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = abs % base;
  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  const body = fracStr ? `${whole}.${fracStr}` : `${whole}`;
  return negative ? `-${body}` : body;
}

/**
 * Parse a human decimal string into a raw on-chain integer amount.
 *
 * @example parseAmount("1.25") // 12_500_000n
 */
export function parseAmount(value: string, decimals = STELLAR_DECIMALS): Amount {
  const trimmed = value.trim();
  if (trimmed === "") {
    throw new Error("parseAmount: input is empty or whitespace");
  }
  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  if (!/^[\d.]*$/.test(unsigned)) {
    throw new Error("parseAmount: invalid characters in " + value);
  }
  const parts = unsigned.split(".");
  if (parts.length > 2) {
    throw new Error("parseAmount: multiple dots in " + value);
  }
  const [whole = "0", frac = ""] = parts;
  if (frac.length > decimals) {
    throw new Error("parseAmount: " + value + " has " + frac.length + " fractional digits but only " + decimals + " supported");
  }
  const fracPadded = frac + "0".repeat(decimals - frac.length);
  const raw = BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(fracPadded || "0");
  return negative ? -raw : raw;
}

/**
 * Percentage of yes-votes among decisive (yes + no) votes, 0–100.
 * Abstentions are excluded from the denominator. Returns 0 when there are no
 * decisive votes.
 */
export function approvalRate(yes: number, no: number, decimalPlaces = 1): number {
  if (Number.isNaN(yes) || Number.isNaN(no)) return 0;
  if (yes < 0 || no < 0) return 0;
  const total = yes + no;
  if (total === 0) return 0;
  const factor = 10 ** decimalPlaces;
  return Math.round((yes / total) * 100 * factor) / factor;
}
