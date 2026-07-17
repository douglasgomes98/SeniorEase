import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { type Locale } from "./locale";
import { createTranslator, type Translator } from "./translator";

export interface I18nContextValue {
  locale: Locale;
  t: Translator;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  locale: Locale;
  children: ReactNode;
}

export function I18nProvider({ locale, children }: I18nProviderProps): ReactNode {
  const value = useMemo<I18nContextValue>(
    () => ({ locale, t: createTranslator(locale) }),
    [locale],
  );
  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n deve ser usado dentro de I18nProvider.");
  }
  return context;
}

export function useTranslation(): Translator {
  return useI18n().t;
}
