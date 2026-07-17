/**
 * Value object: modo de navegacao.
 * "simple" reduz a complexidade visual (padrao para idosos); "standard" expoe
 * o fluxo completo.
 */
export const NAVIGATION_MODES = ["simple", "standard"] as const;

export type NavigationMode = (typeof NAVIGATION_MODES)[number];

export const NAVIGATION_MODE_DEFAULT: NavigationMode = "simple";

export function isNavigationMode(value: unknown): value is NavigationMode {
  return (
    typeof value === "string" &&
    (NAVIGATION_MODES as readonly string[]).includes(value)
  );
}
