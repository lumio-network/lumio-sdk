# Security Policy

## Supported Versions

Lumio SDK is currently in a **pre-release scaffold phase** (v0.1.x). No version has been
audited, and no production deployment is yet using real on-chain funds. All `sdk` clients
stub their Soroban RPC calls — they return mock data or throw `NotImplementedError`.

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅ Yes (pre-release, scaffold) |
| < 0.1   | ❌ No |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Use one of the following channels to report privately:

1. **GitHub Private Vulnerability Reporting** (preferred) — open a [private security
   advisory](https://github.com/lumio-network/lumio-sdk/security/advisories/new) directly
   in this repository. This keeps disclosure confidential until a fix is ready.

2. **Email** — send details to:
   `<!-- MAINTAINER: replace this placeholder with a contact address, e.g. security@lumio.network -->`
   `[PLACEHOLDER — maintainer to fill in]`

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a minimal proof of concept
- The affected version(s) and package(s) (`@lumio/sdk`, `@lumio/shared`, `@lumio/ui`)

## Response Expectations

- **Acknowledgement:** within **72 hours** of receipt
- **Status update:** within **7 days** (confirmed, investigating, or out of scope)
- **Fix timeline:** best-effort; coordinated disclosure will be agreed with the reporter
  before any public disclosure

## Scope

In scope for this phase:

- Logic bugs in `@lumio/shared` utilities (`parseAmount`, `formatAmount`, `isValidAddress`, etc.)
- Type-safety issues that could mislead consumers into unsafe on-chain calls
- Dependency vulnerabilities in published packages

Out of scope (scaffold phase):

- The unimplemented Soroban RPC transport (it doesn't exist yet)
- UI visual issues
- Issues in `devDependencies` that do not affect the published packages

## Disclosure Policy

We follow a **coordinated responsible disclosure** model. We ask reporters to:

1. Give us a reasonable window to investigate and patch before public disclosure.
2. Avoid accessing or modifying data beyond what is needed to confirm the vulnerability.
3. Act in good faith.

We commit to:

1. Acknowledging reports promptly.
2. Keeping reporters informed of progress.
3. Crediting reporters in release notes (unless anonymity is requested).

---

_This policy will be updated when the SDK moves to a production-ready, audited release._
