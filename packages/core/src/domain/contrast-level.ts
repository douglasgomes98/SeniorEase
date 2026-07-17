/**
 * Value object: nivel de contraste.
 * "standard" (contraste alto AA >= 4.5:1) e "high" (contraste maximo AAA).
 */
export const CONTRAST_LEVELS = ["standard", "high"] as const;

export type ContrastLevel = (typeof CONTRAST_LEVELS)[number];

export const CONTRAST_LEVEL_DEFAULT: ContrastLevel = "standard";

export function isContrastLevel(value: unknown): value is ContrastLevel {
  return (
    typeof value === "string" &&
    (CONTRAST_LEVELS as readonly string[]).includes(value)
  );
}

export function toggleContrastLevel(current: ContrastLevel): ContrastLevel {
  return current === "standard" ? "high" : "standard";
}
