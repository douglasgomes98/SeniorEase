import { DEFAULT_LOCALE, type Locale } from "./locale";
import type { MessageKey } from "./messages";
import { catalogs } from "./locales";

export type TranslateParams = Record<string, string | number>;

const INTERPOLATION = /\{(\w+)\}/g;

/**
 * Traducao pura com interpolacao de parametros no formato {nome}.
 * Cai para o idioma padrao quando o catalogo do locale nao existir.
 */
export function translate(
  locale: Locale,
  key: MessageKey,
  params?: TranslateParams,
): string {
  const catalog = catalogs[locale] ?? catalogs[DEFAULT_LOCALE];
  const template = catalog[key];
  if (!params) {
    return template;
  }
  return template.replace(INTERPOLATION, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export function createTranslator(locale: Locale) {
  return (key: MessageKey, params?: TranslateParams): string =>
    translate(locale, key, params);
}

export type Translator = ReturnType<typeof createTranslator>;
