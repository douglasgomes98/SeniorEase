import { describe, it, expect } from "vitest";
import {
  FONT_SCALE_MIN,
  FONT_SCALE_MAX,
  FONT_SCALE_DEFAULT,
  clampFontScale,
  increaseFontScale,
  decreaseFontScale,
  isFontScaleAtMin,
  isFontScaleAtMax,
} from "./font-scale";

describe("font-scale", () => {
  // gate do painel: A- desliga no piso, A+ desliga no teto
  it("reports the minimum bound at and below 100%", () => {
    expect(isFontScaleAtMin(FONT_SCALE_MIN)).toBe(true);
    expect(isFontScaleAtMin(0.5)).toBe(true);
    // clamp: nao ha passo abaixo do piso
    expect(decreaseFontScale(FONT_SCALE_MIN)).toBe(FONT_SCALE_MIN);
  });

  it("reports the maximum bound at and above 200%", () => {
    expect(isFontScaleAtMax(FONT_SCALE_MAX)).toBe(true);
    expect(isFontScaleAtMax(2.5)).toBe(true);
    // clamp: nao ha passo acima do teto
    expect(increaseFontScale(FONT_SCALE_MAX)).toBe(FONT_SCALE_MAX);
  });

  it("reports no bound while inside the range", () => {
    for (const value of [1.15, 1.9]) {
      expect(isFontScaleAtMin(value)).toBe(false);
      expect(isFontScaleAtMax(value)).toBe(false);
    }
  });

  it("steps by 15% and rounds to two decimals", () => {
    expect(increaseFontScale(1.0)).toBe(1.15);
    expect(decreaseFontScale(1.3)).toBe(1.15);
    expect(increaseFontScale(1.15)).toBe(1.3);
  });

  it("clamps into the range and falls back on invalid input", () => {
    expect(clampFontScale(3)).toBe(FONT_SCALE_MAX);
    expect(clampFontScale(0)).toBe(FONT_SCALE_MIN);
    expect(clampFontScale(Number.NaN)).toBe(FONT_SCALE_DEFAULT);
    expect(clampFontScale(Number.POSITIVE_INFINITY)).toBe(FONT_SCALE_DEFAULT);
  });
});
