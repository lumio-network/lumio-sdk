import type { Address, Amount, NetworkConfig, NetworkName } from "./types";
import { NETWORKS } from "./types";

/** Number of decimal places Stellar uses for native amounts. */
export const STELLAR_DECIMALS = 7;

/**
 * Shorten an address for display, e.g. `truncateAddress("GABC…", 4)` → `"GABC…WXYZ"`.
 * Returns the address unchanged if it is already short enough.
 *
 * @throws {RangeError} if `visible` is not a positive finite integer.
 */
export function truncateAddress(address: Address, visible = 4): string {
  if (!Number.isFinite(visible) || !Number.isInteger(visible) || visible <= 0) {
    throw new RangeError(`visible must be a positive integer, got ${visible}`);
  }
  if (address.length <= visible * 2 + 1) return address;
  return `${address.slice(0, visible)}…${address.slice(-visible)}`;
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
 * Thrown by {@link parseAmount} when the input string is not a valid decimal
 * amount or has more fractional digits than the target precision allows.
 */
export class InvalidAmountError extends Error {
  constructor(value: string) {
    super(`Invalid amount "${value}"`);
    this.name = "InvalidAmountError";
  }
}

/**
 * Parse a human decimal string into a raw on-chain integer amount.
 *
 * Accepted format: an optional leading `-`, one or more decimal digits,
 * optionally followed by a single `.` and one or more decimal digits.
 * Anything else — empty strings, whitespace-only, multiple dots, scientific
 * notation (`1e3`), underscores (`1_000`), currency symbols (`$5`), etc. —
 * throws {@link InvalidAmountError} naming the bad value.
 *
 * Precision policy: inputs with more fractional digits than `decimals` are
 * rejected (throw {@link InvalidAmountError}) rather than silently truncated,
 * so callers always know exactly what value was stored on-chain.
 *
 * @example parseAmount("1.25") // 12_500_000n
 * @throws {InvalidAmountError} if `value` is malformed or over-precise
 */
export function parseAmount(value: string, decimals = STELLAR_DECIMALS): Amount {
  // Strict format: optional -, digits, optional (.digits)
  const VALID = /^-?\d+(\.\d+)?$/;
  if (!VALID.test(value.trim())) {
    throw new InvalidAmountError(value);
  }

  const trimmed = value.trim();
  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const dotIndex = unsigned.indexOf(".");
  const whole = dotIndex === -1 ? unsigned : unsigned.slice(0, dotIndex);
  const frac = dotIndex === -1 ? "" : unsigned.slice(dotIndex + 1);

  if (frac.length > decimals) {
    throw new InvalidAmountError(value);
  }

  const fracPadded = frac.padEnd(decimals, "0");
  const raw = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fracPadded);
  return negative ? -raw : raw;
}

/**
 * Percentage of yes-votes among decisive (yes + no) votes, 0–100.
 * Abstentions are excluded from the denominator. Returns 0 when there are no
 * decisive votes.
 *
 * @throws {RangeError} if `yes` or `no` is negative or non-finite (NaN / ±Infinity).
 */
export function approvalRate(yes: number, no: number, decimalPlaces = 1): number {
  if (!Number.isFinite(yes) || yes < 0) {
    throw new RangeError(`yes must be a non-negative finite number, got ${yes}`);
  }
  if (!Number.isFinite(no) || no < 0) {
    throw new RangeError(`no must be a non-negative finite number, got ${no}`);
  }
  const total = yes + no;
  if (total === 0) return 0;
  const factor = 10 ** decimalPlaces;
  return Math.round((yes / total) * 100 * factor) / factor;
}

/**
 * Resolve a {@link NetworkConfig} by its well-known name.
 *
 * @example getNetwork("testnet") // { rpcUrl: "https://soroban-testnet.stellar.org", ... }
 */
export function getNetwork(name: NetworkName): NetworkConfig {
  return NETWORKS[name];
}

/**
 * A lightweight format guard for Stellar addresses (public keys and contract ids).
 *
 * Returns `true` when `value` matches the shape of a well-formed Stellar strkey:
 * - 56 characters long
 * - Starts with `G` (ed25519 public key) or `C` (contract id)
 * - Contains only base32 characters (A–Z and 2–7)
 *
 * **Limitation:** this is a shape check only — it does not verify the Stellar
 * strkey checksum or confirm the address exists on-chain.
 */
export function isValidAddress(value: string): boolean {
  return /^[GC][A-Z2-7]{55}$/.test(value);
}
