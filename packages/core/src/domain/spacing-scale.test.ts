import { describe, it, expect } from "vitest";
import {
  SPACING_SCALES,
  SPACING_SCALE_DEFAULT,
  isSpacingScale,
  normalizeSpacingScale,
} from "./spacing-scale";

describe("spacing-scale", () => {
  it("accepts each allowed value", () => {
    for (const scale of SPACING_SCALES) {
      expect(isSpacingScale(scale)).toBe(true);
      expect(normalizeSpacingScale(scale)).toBe(scale);
    }
  });

  it("defaults to 1.0", () => {
    expect(SPACING_SCALE_DEFAULT).toBe(1.0);
  });

  // test_spacing_scale_rejects_unknown
  it("falls back to the default for out-of-set values", () => {
    expect(isSpacingScale(2.0)).toBe(false);
    expect(normalizeSpacingScale(2.0)).toBe(SPACING_SCALE_DEFAULT);
    expect(normalizeSpacingScale("1.25")).toBe(SPACING_SCALE_DEFAULT);
    expect(normalizeSpacingScale(null)).toBe(SPACING_SCALE_DEFAULT);
    expect(normalizeSpacingScale(undefined)).toBe(SPACING_SCALE_DEFAULT);
  });
});
