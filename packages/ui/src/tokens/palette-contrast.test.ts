import { describe, it, expect } from "vitest";
import { palettes, type Palette } from "./index";

/** Luminancia relativa de um canal sRGB (WCAG 2.x). */
function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Razao de contraste WCAG entre duas cores (1..21). */
function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Pares texto/fundo que devem cumprir o alvo de contraste. */
const TEXT_PAIRS: Array<[keyof Palette, keyof Palette]> = [
  ["ink", "bg"],
  ["inkSoft", "bg"],
  ["accentInk", "accent"],
  ["successInk", "success"],
  ["dangerInk", "danger"],
];

describe("palette contrast", () => {
  // test_standard_palette_meets_AA
  it("standard palette meets WCAG AA (>= 4.5:1) for every text pair", () => {
    for (const [fg, bg] of TEXT_PAIRS) {
      const ratio = contrastRatio(palettes.standard[fg], palettes.standard[bg]);
      expect(ratio, `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  // test_maximum_palette_meets_AAA
  it("maximum palette meets WCAG AAA (>= 7:1) for every text pair", () => {
    for (const [fg, bg] of TEXT_PAIRS) {
      const ratio = contrastRatio(palettes.maximum[fg], palettes.maximum[bg]);
      expect(ratio, `${fg} on ${bg}`).toBeGreaterThanOrEqual(7);
    }
  });
});
