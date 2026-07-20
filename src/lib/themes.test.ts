import { describe, expect, it } from "vitest";
import { THEMES } from "@/lib/themes";

const REQUIRED_CSS_VARS = [
  "--p-bg",
  "--p-bg-secondary",
  "--p-bg-card",
  "--p-fg",
  "--p-fg-muted",
  "--p-primary",
  "--p-border",
  "--p-font",
  "--p-radius",
  "--p-border-width",
  "--p-border-style",
  "--p-shadow",
  "--p-shadow-hover",
  "--p-blur",
  "--p-transform-hover",
  "--p-pill-bg",
] as const;

describe("THEMES", () => {
  it("defines at least the core themes", () => {
    expect(Object.keys(THEMES).length).toBeGreaterThanOrEqual(6);
  });

  it("includes required CSS variables for every theme", () => {
    for (const theme of Object.values(THEMES)) {
      for (const cssVar of REQUIRED_CSS_VARS) {
        expect(theme.cssVars[cssVar], `${theme.id} missing ${cssVar}`).toBeTruthy();
      }
    }
  });
});
