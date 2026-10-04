import type { Address, Amount, NetworkConfig, NetworkName, ProposalStatus, Tally } from "./types";
import { NETWORK_NAMES, NETWORKS } from "./types";

/** Number of decimal places Stellar uses for native amounts. */
export const STELLAR_DECIMALS = 7;

function assertValidDecimals(decimals: number): void {
  if (!Number.isSafeInteger(decimals) || decimals < 0) {
    throw new RangeError(`decimals must be a non-negative safe integer, got ${decimals}`);
  }
}

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
  assertValidDecimals(decimals);
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
 * Format a raw on-chain amount with exactly `fractionDigits` decimal places.
 * Midpoint values are rounded away from zero.
 */
export function formatAmountFixed(
  amount: Amount,
  fractionDigits: number,
  decimals = STELLAR_DECIMALS,
): string {
  if (!Number.isSafeInteger(fractionDigits) || fractionDigits < 0) {
    throw new RangeError(
      `fractionDigits must be a non-negative safe integer, got ${fractionDigits}`,
    );
  }
  if (!Number.isSafeInteger(decimals) || decimals < 0) {
    throw new RangeError(`decimals must be a non-negative safe integer, got ${decimals}`);
  }

  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  let scaled = abs;

  if (fractionDigits < decimals) {
    const divisor = 10n ** BigInt(decimals - fractionDigits);
    scaled = (abs + divisor / 2n) / divisor;
  } else if (fractionDigits > decimals) {
    scaled *= 10n ** BigInt(fractionDigits - decimals);
  }

  const base = 10n ** BigInt(fractionDigits);
  const whole = scaled / base;
  const fraction = scaled % base;
  const body =
    fractionDigits === 0
      ? `${whole}`
      : `${whole}.${fraction.toString().padStart(fractionDigits, "0")}`;
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
  assertValidDecimals(decimals);
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

/** Parse an amount without throwing for invalid amount strings. */
export function tryParseAmount(
  value: string,
  decimals = STELLAR_DECIMALS,
): { ok: true; value: Amount } | { ok: false; error: string } {
  try {
    return { ok: true, value: parseAmount(value, decimals) };
  } catch (error) {
    if (error instanceof InvalidAmountError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
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

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

/** Return whether a proposal is open for voting. */
export function isOpen(status: ProposalStatus): boolean {
  switch (status) {
    case "open":
      return true;
    case "passed":
    case "rejected":
    case "executed":
      return false;
    default:
      return assertNever(status);
  }
}

/** Return whether a proposal has reached a terminal status. */
export function isTerminal(status: ProposalStatus): boolean {
  switch (status) {
    case "open":
      return false;
    case "passed":
    case "rejected":
    case "executed":
      return true;
    default:
      return assertNever(status);
  }
}

/**
 * Return a zeroed {@link Tally} — the canonical empty/initial tally.
 * A fresh object is returned on every call.
 */
export function emptyTally(): Tally {
  return { yes: 0, no: 0, abstain: 0 };
}

/** Return the total number of votes, including abstentions. */
export function tallyTotal(tally: Tally): number {
  return tally.yes + tally.no + tally.abstain;
}

/** Return the yes-vote percentage among decisive votes in a tally. */
export function approvalRateOf(tally: Tally): number {
  return approvalRate(tally.yes, tally.no);
}

/**
 * Resolve a {@link NetworkConfig} by its well-known name.
 *
 * @example getNetwork("testnet") // { rpcUrl: "https://soroban-testnet.stellar.org", ... }
 */
export function getNetwork(name: NetworkName): NetworkConfig {
  return NETWORKS[name];
}

/** Resolve a known network by its Stellar network passphrase. */
export function getNetworkByPassphrase(passphrase: string): NetworkConfig | undefined {
  return Object.values(NETWORKS).find((network) => network.networkPassphrase === passphrase);
}

/**
 * Type guard for arbitrary strings (query params, env vars, config) that may
 * name a known network. Narrows `string` to {@link NetworkName} so the value
 * can be passed to {@link getNetwork}.
 *
 * @example isNetworkName("testnet") // true
 */
export function isNetworkName(value: string): value is NetworkName {
  return NETWORK_NAMES.includes(value as NetworkName);
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

/** Returns `true` when `value` has the shape of a Stellar contract id. */
export function isContractId(value: string): value is Address {
  return value.startsWith("C") && isValidAddress(value);
}

/** Returns `true` when `value` has the shape of a Stellar public key. */
export function isPublicKey(value: string): value is Address {
  return value.startsWith("G") && isValidAddress(value);
}

/** Thrown when a value does not have the shape of a Stellar address. */
export class InvalidAddressError extends Error {
  constructor(value: string, label?: string) {
    super(label ? `Invalid ${label} address "${value}"` : `Invalid address "${value}"`);
    this.name = "InvalidAddressError";
  }
}

/** Throws when `value` does not have the shape of a Stellar address. */
export function assertValidAddress(value: string, label?: string): asserts value is Address {
  if (!isValidAddress(value)) {
    throw new InvalidAddressError(value, label);
  }
}
