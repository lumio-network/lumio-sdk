import type { Config } from "tailwindcss";

/**
 * Lumio Tailwind preset — the "Ledger of Light" design language.
 *
 * Every value points at a `--lumio-*` CSS custom property from
 * `@lumio/ui/tokens/design-tokens.css`, so utilities like `bg-lumen` or
 * `text-ink` resolve to the single source of truth in the tokens file. Apps add
 * this to their `presets: [lumioPreset]` and import the tokens CSS once.
 *
 * Exported as a named binding (not a default) so it survives the CommonJS
 * interop in Tailwind's config loader without an unwrapping step.
 */
export const lumioPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--lumio-ink)",
          950: "var(--lumio-ink-950)",
          900: "var(--lumio-ink-900)",
          800: "var(--lumio-ink-800)",
          700: "var(--lumio-ink-700)",
          600: "var(--lumio-ink-600)",
          400: "var(--lumio-ink-400)",
        },
        paper: {
          DEFAULT: "var(--lumio-paper)",
          50: "var(--lumio-paper-50)",
          100: "var(--lumio-paper-100)",
          200: "var(--lumio-paper-200)",
          400: "var(--lumio-paper-400)",
          600: "var(--lumio-paper-600)",
        },
        lumen: {
          DEFAULT: "var(--lumio-lumen)",
          dim: "var(--lumio-lumen-dim)",
        },
        teal: {
          DEFAULT: "var(--lumio-teal)",
          "on-light": "var(--lumio-teal-on-light)",
        },
        coral: {
          DEFAULT: "var(--lumio-coral)",
          "on-light": "var(--lumio-coral-on-light)",
        },
        sky: {
          DEFAULT: "var(--lumio-sky)",
          "on-light": "var(--lumio-sky-on-light)",
        },
      },
      fontFamily: {
        display: ["var(--lumio-font-display)"],
        ui: ["var(--lumio-font-ui)"],
        mono: ["var(--lumio-font-mono)"],
      },
      // Sizes + line-heights from the §5.2 type scale. Weight and family stay as
      // separate `font-*` utilities so they can be overridden per element.
      fontSize: {
        "display-xl": ["64px", { lineHeight: "1.05" }],
        "display-l": ["44px", { lineHeight: "1.1" }],
        "heading-l": ["28px", { lineHeight: "1.25" }],
        "heading-m": ["22px", { lineHeight: "1.3" }],
        "heading-s": ["18px", { lineHeight: "1.35" }],
        body: ["16px", { lineHeight: "1.55" }],
        "body-s": ["14px", { lineHeight: "1.5" }],
        caption: ["12px", { lineHeight: "1.4" }],
        data: ["15px", { lineHeight: "1.4" }],
      },
      borderRadius: {
        s: "var(--lumio-radius-s)",
        m: "var(--lumio-radius-m)",
        l: "var(--lumio-radius-l)",
        round: "var(--lumio-radius-round)",
      },
      boxShadow: {
        s: "var(--lumio-shadow-s)",
        m: "var(--lumio-shadow-m)",
        l: "var(--lumio-shadow-l)",
      },
      transitionTimingFunction: {
        standard: "var(--lumio-ease-standard)",
      },
      transitionDuration: {
        fast: "var(--lumio-duration-fast)",
        base: "var(--lumio-duration-base)",
        slow: "var(--lumio-duration-slow)",
      },
    },
  },
};

