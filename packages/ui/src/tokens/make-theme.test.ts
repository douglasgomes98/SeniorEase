import { describe, it, expect } from "vitest";
import { makeTheme, defaultTheme, typeScale, spacing } from "./index";

describe("makeTheme", () => {
  // test_make_theme_maps_high_to_maximum
  it("maps the domain value 'high' to the maximum palette", () => {
    const theme = makeTheme({ contrast: "high" });
    expect(theme.contrast).toBe("high"); // ecoa o valor de dominio
    expect(theme.colors.bg).toBe("#FFFFFF");
    expect(theme.colors.ink).toBe("#000000");
    expect(theme.colors.danger).toBe("#8A2A10");
  });

  // test_make_theme_resolves_standard_palette
  it("resolves the standard palette", () => {
    const theme = makeTheme({ contrast: "standard" });
    expect(theme.colors.bg).toBe("#EEF2F8");
    expect(theme.colors.success).toBe("#166F3D");
    expect(theme.colors.accentSoft).toBe("#E7EEFA");
  });

  // test_make_theme_applies_font_scale
  it("applies the font scale to the type scale", () => {
    const theme = makeTheme({ fontScale: 1.5 });
    expect(theme.font.body).toBe(Math.round(typeScale.body * 1.5));
    expect(theme.font.label).toBe(Math.round(typeScale.label * 1.5));
  });

  // test_make_theme_applies_spacing_scale
  it("applies the spacing scale to the spacing tokens", () => {
    const theme = makeTheme({ spacingScale: 1.25 });
    expect(theme.space.lg).toBe(Math.round(spacing.lg * 1.25));
    expect(theme.space["3xl"]).toBe(Math.round(spacing["3xl"] * 1.25));
  });

  // test_make_theme_exposes_ergonomics_and_focus
  it("exposes ergonomics, focus tokens, typeface and line-height", () => {
    expect(defaultTheme.ergonomics).toEqual({
      touchTargetMin: 48,
      controlHeight: 52,
      controlHeightLg: 60,
    });
    expect(defaultTheme.focus).toEqual({ ringWidth: 3, ringOffset: 2 });
    expect(defaultTheme.fontFamily).toBe("Atkinson Hyperlegible");
    expect(defaultTheme.lineHeight).toBe(1.5);
  });

  it("clamps font and spacing to presentation-safe bounds", () => {
    const over = makeTheme({ fontScale: 5, spacingScale: 9 });
    expect(over.fontScale).toBe(2);
    expect(over.spacingScale).toBe(1.5);

    const under = makeTheme({ fontScale: 0.1, spacingScale: 0.1 });
    expect(under.fontScale).toBe(1);
    expect(under.spacingScale).toBe(1);
  });

  it("defaults to the standard palette at scale 1", () => {
    expect(defaultTheme.contrast).toBe("standard");
    expect(defaultTheme.fontScale).toBe(1);
    expect(defaultTheme.spacingScale).toBe(1);
    expect(defaultTheme.font.body).toBe(typeScale.body);
    expect(defaultTheme.space.lg).toBe(spacing.lg);
  });
});
