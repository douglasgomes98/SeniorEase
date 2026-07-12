/**
 * Tokens de design canonicos (compartilhados: React + React Native).
 *
 * Valores adotados do prototipo aprovado (requisitos/visual/tokens): tamanhos
 * base ampliados, alvos de toque generosos e paletas com contraste AA/AAA.
 * Escala de fonte e espacamento sao multiplicadores de runtime, resolvidos a
 * partir das preferencias persistidas do usuario. Nenhuma regra de negocio -
 * apenas valores de apresentacao e a fabrica que os resolve em um tema.
 *
 * Uso:
 *   const theme = makeTheme({ contrast, fontScale, spacingScale });
 *   // theme.colors.accent, theme.font.body, theme.space.lg, ...
 */

/** Fonte da interface, desenhada para baixa visao. */
export const fontFamily = "Atkinson Hyperlegible";

/** Fonte de icones; sempre acompanhada de um rotulo de texto (nunca sozinha). */
export const iconFontFamily = "Material Symbols Rounded";

/** Altura de linha confortavel para leitura (WCAG 1.4.8). */
export const lineHeight = 1.5;

/** Escala de tipos base (px/dp) - multiplicada por fontScale em runtime. */
export const typeScale = {
  caption: 16,
  body: 20,
  label: 22,
  title: 28,
  heading: 34,
} as const;

export type TypeKey = keyof typeof typeScale;

/** Tamanho de fonte varia de 100% a 200% em passos de 15% (limitado a 200%). */
export const fontScaleBounds = { min: 1, max: 2 } as const;

/** Espacamento base (px/dp) - multiplicado por spacingScale em runtime. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

export type SpaceKey = keyof typeof spacing;

/** Multiplicador de espacamento: 1.0 / 1.25 / 1.5. */
export const spacingScaleBounds = { min: 1, max: 1.5 } as const;

export const radii = { sm: 12, md: 14, lg: 18, pill: 999 } as const;

export type RadiusKey = keyof typeof radii;

export const ergonomics = {
  /** Alvo minimo de toque em ambas plataformas (WCAG 2.5.8). */
  touchTargetMin: 48,
  controlHeight: 52,
  controlHeightLg: 60,
} as const;

/** Anel de foco visivel: 3px de largura, 2px de deslocamento (WCAG 2.4.7). */
export const focus = { ringWidth: 3, ringOffset: 2 } as const;

export const shadow = {
  // Web: usar como boxShadow. Native: usar as props shadow*/elevation.
  web: "0 2px 10px rgba(21,35,59,.06), 0 1px 3px rgba(21,35,59,.05)",
  native: {
    shadowColor: "#15233B",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;

/** Papeis semanticos de cor resolvidos para uma paleta. */
export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  inkSoft: string;
  line: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  success: string;
  successInk: string;
  successSoft: string;
  danger: string;
  dangerInk: string;
  dangerSoft: string;
  focus: string;
  /** Scrim do tour (extensao do F01 sobre o conjunto entregue). */
  overlay: string;
}

/** Chave de paleta do sistema de design (o dominio usa standard | high). */
export type PaletteKey = "standard" | "maximum";

export const palettes: Record<PaletteKey, Palette> = {
  /** WCAG AA (>= 4.5:1). */
  standard: {
    bg: "#EEF2F8",
    surface: "#FFFFFF",
    surface2: "#F4F7FC",
    ink: "#15233B",
    inkSoft: "#43536E",
    line: "#D3DCEA",
    accent: "#1B57B0",
    accentInk: "#FFFFFF",
    accentSoft: "#E7EEFA",
    success: "#166F3D",
    successInk: "#FFFFFF",
    successSoft: "#E2F1E8",
    danger: "#A6371A",
    dangerInk: "#FFFFFF",
    dangerSoft: "#F7E7E1",
    focus: "#0B3D91",
    overlay: "rgba(21,35,59,0.72)",
  },
  /** WCAG AAA (>= 7:1) - resolvida para o valor de dominio "high". */
  maximum: {
    bg: "#FFFFFF",
    surface: "#FFFFFF",
    surface2: "#EEF1F5",
    ink: "#000000",
    inkSoft: "#1C1C1C",
    line: "#1B2430",
    accent: "#0A3A82",
    accentInk: "#FFFFFF",
    accentSoft: "#DDE7F6",
    success: "#0B5A2E",
    successInk: "#FFFFFF",
    successSoft: "#DBEEE2",
    danger: "#8A2A10",
    dangerInk: "#FFFFFF",
    dangerSoft: "#F4E2DC",
    focus: "#000000",
    overlay: "rgba(0,0,0,0.9)",
  },
};

/**
 * Valor de contraste do DOMINIO (persistido no F03 e rotulado no i18n). O
 * mapeamento high -> paleta "maximum" acontece dentro de makeTheme; nao ha
 * renomeacao no dominio nem migracao de dados.
 */
export type ContrastInput = "standard" | "high";

const PALETTE_BY_CONTRAST: Record<ContrastInput, PaletteKey> = {
  standard: "standard",
  high: "maximum",
};

export interface ThemeInput {
  /** Valor de dominio; "high" resolve a paleta "maximum". */
  contrast?: ContrastInput;
  /** 1..2, ja limitado/discretizado pelo VO de core (font-scale). */
  fontScale?: number;
  /** 1 | 1.25 | 1.5, vindo do VO de core (spacing-scale). */
  spacingScale?: number;
}

/** Tema totalmente resolvido, consumido por toda a UI via useTheme(). */
export interface Theme {
  /** Ecoa o valor de dominio (standard | high). */
  contrast: ContrastInput;
  fontScale: number;
  spacingScale: number;
  fontFamily: string;
  iconFontFamily: string;
  lineHeight: number;
  colors: Palette;
  /** typeScale x fontScale, arredondado. */
  font: Record<TypeKey, number>;
  /** spacing x spacingScale, arredondado. */
  space: Record<SpaceKey, number>;
  radii: typeof radii;
  ergonomics: typeof ergonomics;
  focus: typeof focus;
  shadow: typeof shadow;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Resolve um tema de runtime a partir das preferencias persistidas.
 * Aplica limites seguros de apresentacao sobre entradas ja validadas pelo core
 * (os invariantes autoritativos de escala vivem nos value objects do dominio).
 */
export function makeTheme({
  contrast = "standard",
  fontScale = 1,
  spacingScale = 1,
}: ThemeInput = {}): Theme {
  const fs = clamp(fontScale, fontScaleBounds.min, fontScaleBounds.max);
  const ss = clamp(spacingScale, spacingScaleBounds.min, spacingScaleBounds.max);

  const font = Object.fromEntries(
    Object.entries(typeScale).map(([key, value]) => [key, Math.round(value * fs)]),
  ) as Record<TypeKey, number>;

  const space = Object.fromEntries(
    Object.entries(spacing).map(([key, value]) => [key, Math.round(value * ss)]),
  ) as Record<SpaceKey, number>;

  return {
    contrast,
    fontScale: fs,
    spacingScale: ss,
    fontFamily,
    iconFontFamily,
    lineHeight,
    colors: palettes[PALETTE_BY_CONTRAST[contrast]],
    font,
    space,
    radii,
    ergonomics,
    focus,
    shadow,
  };
}

export const defaultTheme = makeTheme();
