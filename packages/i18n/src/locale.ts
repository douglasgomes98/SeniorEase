/**
 * Idiomas suportados (regra do projeto): portugues, ingles e espanhol.
 * O locale e a autoridade central de internacionalizacao e tambem uma
 * preferencia persistida do usuario.
 */
export const LOCALES = ["pt", "en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Resolve um identificador do sistema (ex.: "pt-BR", "en_US") para um Locale. */
export function resolveLocale(candidate: string | null | undefined): Locale {
  if (!candidate) {
    return DEFAULT_LOCALE;
  }
  const base = candidate.toLowerCase().split(/[-_]/)[0] ?? "";
  return isLocale(base) ? base : DEFAULT_LOCALE;
}

/** Proximo idioma no ciclo pt -> en -> es -> pt. */
export function nextLocale(current: Locale): Locale {
  const index = LOCALES.indexOf(current);
  return LOCALES[(index + 1) % LOCALES.length] ?? DEFAULT_LOCALE;
}
