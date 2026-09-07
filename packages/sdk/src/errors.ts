/**
 * Thrown by SDK methods whose Soroban RPC wiring has not been implemented yet.
 *
 * Read methods return typed mock data so apps can render; state-changing methods
 * (which need transaction signing) throw this until the wiring phase.
 */
export class NotImplementedError extends Error {
  constructor(method: string) {
    super(`${method} is not implemented yet — Soroban RPC wiring lands in a later phase.`);
    this.name = "NotImplementedError";
  }
}
