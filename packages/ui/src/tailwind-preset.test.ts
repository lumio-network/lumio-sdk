import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { lumioPreset } from "./tailwind.preset";

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

describe("Tailwind preset token references", () => {
  it("only references CSS custom properties defined by the design tokens", () => {
    const referencedVariables = collectVariables(lumioPreset);
    const missingVariables = [...referencedVariables]
      .filter((variable) => !definedVariables.has(variable))
      .sort();

    expect(referencedVariables.size).toBeGreaterThan(0);
    expect(missingVariables).toEqual([]);
  });

  it("defines the skeleton-pulse animation", () => {
    const animation = lumioPreset.theme?.extend?.animation as Record<string, string> | undefined;
    expect(animation).toBeDefined();
    expect(animation?.["skeleton-pulse"]).toBeDefined();
    expect(animation?.["skeleton-pulse"]).toContain("skeleton-pulse");
  });

  it("defines the skeleton-pulse keyframes with opacity stops", () => {
    const keyframes = lumioPreset.theme?.extend?.keyframes as
      | Record<string, Record<string, { opacity: string }>>
      | undefined;
    expect(keyframes).toBeDefined();
    expect(keyframes?.["skeleton-pulse"]).toBeDefined();
    expect(keyframes?.["skeleton-pulse"]?.["0%"]).toEqual({ opacity: "0.45" });
    expect(keyframes?.["skeleton-pulse"]?.["100%"]).toEqual({ opacity: "1" });
  });
});
