# @lumio/ui

The [Lumio](https://github.com/lumio-network) design system — React components and a Tailwind
preset built on the "Ledger of Light" brand foundation.

## Install

```bash
pnpm add @lumio/ui
```

`react` and `react-dom` (≥ 18) are peer dependencies.

## Usage

Import the design tokens once at your app root, extend the Tailwind preset, then use the components:

```ts
// app root (e.g. layout.tsx / globals.css)
import "@lumio/ui/tokens/design-tokens.css";
```

```ts
// tailwind.config.ts
import { lumioPreset } from "@lumio/ui/tailwind-preset";

export default {
  presets: [lumioPreset],
  content: ["./app/**/*.{ts,tsx}"],
};
```

```tsx
import { Button, Card, Badge, Input } from "@lumio/ui";

<Button variant="primary">Deposit</Button>;
```

**Accessibility rule:** on a Paper (light) background use only the `*-on-light` / `*-dim` accent
variants for text. Bright accents are for dark backgrounds or large graphics (≥ 24px / 3:1) —
never use raw `--lumio-lumen` as text on Paper.

## License

[Apache-2.0](./LICENSE). Part of the [lumio-sdk](https://github.com/lumio-network/lumio-sdk) monorepo.
