import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { makeTheme, type ContrastInput, type Theme } from "../tokens";

/**
 * Distribui o tema totalmente resolvido a partir das preferencias do usuario
 * (contraste + escala de fonte + escala de espacamento). O app alimenta os
 * valores vindos do core; a UI apenas consome. Uma mudanca em qualquer entrada
 * re-resolve o tema, entao todo componente montado re-renderiza na hora.
 */
export type { Theme };

const ThemeContext = createContext<Theme | null>(null);

export interface ThemeProviderProps {
  /** Valor de dominio: "standard" | "high" (mapeado internamente). */
  contrast: ContrastInput;
  fontScale: number;
  spacingScale: number;
  children: ReactNode;
}

export function ThemeProvider({
  contrast,
  fontScale,
  spacingScale,
  children,
}: ThemeProviderProps): ReactNode {
  const value = useMemo<Theme>(
    () => makeTheme({ contrast, fontScale, spacingScale }),
    [contrast, fontScale, spacingScale],
  );
  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  }
  return theme;
}
