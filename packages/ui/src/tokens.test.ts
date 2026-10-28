import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import designTokens from "./tokens/design-tokens.json";
import { tokens } from "./index";

const css = readFileSync(
  fileURLToPath(new URL("./tokens/design-tokens.css", import.meta.url)),
  "utf8",
);

const cssDeclarations = [...css.matchAll(/^\s*(--lumio-[\w-]+)\s*:\s*([^;]+);/gm)];
const cssVariables = new Map(
  cssDeclarations.map(([, name, value]) => [name, value.trim().replace(/\s+/g, " ")]),
);

function getExpectedCssVariables(): Map<string, string> {
  const expected = new Map<string, string>();
  const add = (name: string, value: string) => expected.set(`--lumio-${name}`, value);

  for (const [name, token] of Object.entries(designTokens.color.brand)) {
    add(name, token.value);
  }
  for (const [name, token] of Object.entries(designTokens.color.semantic)) {
    add(name, token.value);
    add(`${name}-on-light`, token.on_light_text);
  }
  for (const [name, value] of Object.entries(designTokens.color.neutral_dark)) {
    add(name, value);
  }
  for (const [name, value] of Object.entries(designTokens.color.neutral_light)) {
    add(name, value);
  }
  for (const [name, family] of Object.entries(designTokens.typography.families)) {
    add(`font-${name}`, `"${family.name}", ${family.fallbacks}`);
  }
  for (const [name, scale] of Object.entries(designTokens.typography.scale)) {
    add(
      `text-${name}`,
      `${scale.weight} ${scale.size}/${scale.line_height} var(--lumio-font-${scale.family})`,
    );
  }
  for (const [name, value] of Object.entries(designTokens.radius)) {
    add(`radius-${name}`, value);
  }
  for (const [name, value] of Object.entries(designTokens.shadow)) {
    add(`shadow-${name}`, value);
  }
  for (const [name, value] of Object.entries(designTokens.motion)) {
    add(name, value);
  }
  for (const [name, value] of Object.entries(designTokens.focus)) {
    add(`focus-${name}`, value);
  }

  return expected;
}

describe("design tokens", () => {
  it("exports the typed design-tokens JSON object", () => {
    expect(tokens).toEqual(designTokens);
  });

  it("keeps JSON token declarations and CSS variables in sync", () => {
    const expected = getExpectedCssVariables();

    expect(cssVariables.size).toBe(cssDeclarations.length);
    expect([...cssVariables.keys()].sort()).toEqual([...expected.keys()].sort());
    for (const [name, value] of expected) {
      expect(cssVariables.get(name), `${name} should match design-tokens.json`).toBe(value);
    }
  });
});
