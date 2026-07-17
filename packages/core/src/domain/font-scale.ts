/**
 * Value object: escala de fonte.
 * Regra de acessibilidade para idosos: a fonte varia entre 100% e 200%,
 * em passos previsiveis. As invariantes de clamp vivem aqui - nunca na UI.
 */
export const FONT_SCALE_MIN = 1.0;
export const FONT_SCALE_MAX = 2.0;
export const FONT_SCALE_STEP = 0.15;
export const FONT_SCALE_DEFAULT = 1.0;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function clampFontScale(value: number): number {
  if (!Number.isFinite(value)) {
    return FONT_SCALE_DEFAULT;
  }
  return round(Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, value)));
}

export function increaseFontScale(current: number): number {
  return clampFontScale(clampFontScale(current) + FONT_SCALE_STEP);
}

export function decreaseFontScale(current: number): number {
  return clampFontScale(clampFontScale(current) - FONT_SCALE_STEP);
}

export function isFontScaleAtMax(current: number): boolean {
  return clampFontScale(current) >= FONT_SCALE_MAX;
}

export function isFontScaleAtMin(current: number): boolean {
  return clampFontScale(current) <= FONT_SCALE_MIN;
}
