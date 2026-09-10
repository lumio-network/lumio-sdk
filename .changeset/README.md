# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets). Each pending
release note lives here as a Markdown file until `pnpm version-packages` consumes it.

- Add a changeset: `pnpm changeset` (pick the bump, write a one-line summary).
- The three `@lumio/*` packages are versioned together (see `fixed` in `config.json`), so one
  changeset bumps all of them in lockstep.
- See [`PUBLISHING.md`](../PUBLISHING.md) for the full release runbook.
