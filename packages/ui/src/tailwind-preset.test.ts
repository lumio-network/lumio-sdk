import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { lumioPreset } from "./tailwind.preset";
import designTokens from "./tokens/design-tokens.json";

const css = readFileSync(
  fileURLToPath(new URL("./tokens/design-tokens.css", import.meta.url)),
  "utf8",
);
const definedVariables = new Set(
  [...css.matchAll(/^\s*(--lumio-[\w-]+)\s*:/gm)].map(([, name]) => name),
);

function collectVariables(value: unknown, variables = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    for (const [, variable] of value.matchAll(/var\(\s*(--lumio-[\w-]+)/g)) {
      variables.add(variable);
    }
  } else if (Array.isArray(value)) {
    for (const entry of value) collectVariables(entry, variables);
  } else if (typeof value === "object" && value !== null) {
    for (const entry of Object.values(value)) collectVariables(entry, variables);
  }

  return variables;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

describe("Tailwind preset token references", () => {
  it("only references CSS custom properties defined by the design tokens", () => {
    const referencedVariables = collectVariables(lumioPreset);
    const missingVariables = [...referencedVariables]
      .filter((variable) => !definedVariables.has(variable))
      .sort();

    expect(referencedVariables.size).toBeGreaterThan(0);
    expect(missingVariables).toEqual([]);
  });
});

describe("Tailwind preset skeleton-pulse animation", () => {
  it("defines the skeleton-pulse animation", () => {
    const animation = (() => {
      const candidate = lumioPreset.theme?.extend?.animation;
      return isRecord(candidate) ? candidate : undefined;
    })();

    expect(animation).toBeDefined();
    expect(typeof animation?.["skeleton-pulse"] === "string").toBe(true);

    const value = animation?.["skeleton-pulse"] as string | undefined;
    expect(typeof value === "string" && value.length > 0).toBe(true);
  });
});

describe("Tailwind preset skeleton-pulse keyframes", () => {
  it("defines skeleton-pulse keyframes with 0% and 100% opacity stops", () => {
    const keyframes = (() => {
      const candidate = lumioPreset.theme?.extend?.keyframes;
      return isRecord(candidate) ? candidate : undefined;
    })();

    expect(keyframes).toBeDefined();
    expect(keyframes?.["skeleton-pulse"]).toBeDefined();

    const entry = keyframes?.["skeleton-pulse"] as Record<string, unknown> | undefined;
    if (!entry || !isRecord(entry)) {
      expect.fail("skeleton-pulse keyframes must be an object of stop -> style");
    }

    expect(entry["0%"]).toBeDefined();
    expect(entry["100%"]).toBeDefined();

    const opacityAt = (stop: string): unknown => {
      const stopValue = entry[stop];
      if (isRecord(stopValue) && typeof (stopValue as Record<string, unknown>).opacity === "string") {
        return (stopValue as Record<string, unknown>).opacity;
      }
      return undefined;
    };

    expect(opacityAt("0%")).toBeDefined();
    expect(opacityAt("100%")).toBeDefined();
  });
});

describe("Tailwind preset fontSize scale matches design tokens", () => {
  it("every design-token typography scale entry matches the Tailwind preset", () => {
    const fontSizeScaleEntries = Object.entries(
      (designTokens as {
        typography: { scale: Record<string, { size: string; line_height: string }> };
      }).typography.scale
    );

    const presetEntries = (lumioPreset.theme?.extend?.fontSize ?? {}) as Record<string, unknown>;
    expect(presetEntries).toBeDefined();

    (() => {
      for (const [name, tokenScale] of fontSizeScaleEntries) {
        const presetEntry = presetEntries[name];
        expect(presetEntry).toBeDefined();

        if (!isRecord(presetEntry)) {
          expect.fail(`fontSize["${name}"] is not an object: ${typeof presetEntry}`);
        }

        const presetEntryTyped = (presetEntry as unknown) as [string, { lineHeight?: string }];
        const presetSize = presetEntryTyped[0];
        const presetLineHeight = (presetEntryTyped[1] ?? {}) as { lineHeight?: string };

        expect(presetSize).toBe(tokenScale.size);
        expect(presetLineHeight.lineHeight).toBe(tokenScale.line_height);
      }
    })();
  });
});
