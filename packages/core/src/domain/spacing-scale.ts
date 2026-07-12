/**
 * Value object: escala de espacamento.
 * Multiplica o espacamento base para leitura confortavel (idosos). Os valores
 * permitidos e a normalizacao vivem aqui - nunca na UI.
 */
export const SPACING_SCALES = [1.0, 1.25, 1.5] as const;

export type SpacingScale = (typeof SPACING_SCALES)[number];

export const SPACING_SCALE_DEFAULT: SpacingScale = 1.0;

export function isSpacingScale(value: unknown): value is SpacingScale {
  return (
    typeof value === "number" &&
    (SPACING_SCALES as readonly number[]).includes(value)
  );
}

/**
 * Reduz qualquer entrada a um valor permitido, caindo para o padrao seguro
 * quando o valor esta fora do conjunto (fail-safe).
 */
export function normalizeSpacingScale(value: unknown): SpacingScale {
  return isSpacingScale(value) ? value : SPACING_SCALE_DEFAULT;
}
