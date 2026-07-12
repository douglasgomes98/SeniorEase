import {
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native";
import { useTheme } from "../theme/theme-context";

export type TextVariant = "caption" | "body" | "label" | "title" | "heading";
export type TextWeight = "regular" | "medium" | "bold";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  muted?: boolean;
  color?: string;
}

const WEIGHTS: Record<TextWeight, TextStyle["fontWeight"]> = {
  regular: "400",
  medium: "600",
  bold: "700",
};

const DEFAULT_WEIGHT: Record<TextVariant, TextWeight> = {
  caption: "regular",
  body: "regular",
  label: "medium",
  title: "bold",
  heading: "bold",
};

/**
 * Texto acessivel: le o tamanho ja escalado do tema, a fonte de baixa visao e a
 * altura de linha confortavel (1.5). Componente puro, dirigido por props.
 */
export function Text({
  variant = "body",
  weight,
  muted = false,
  color,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const fontSize = theme.font[variant];
  const resolvedColor = color ?? (muted ? theme.colors.inkSoft : theme.colors.ink);
  const resolvedWeight = WEIGHTS[weight ?? DEFAULT_WEIGHT[variant]];

  return (
    <RNText
      style={[
        {
          fontFamily: theme.fontFamily,
          fontSize,
          lineHeight: fontSize * theme.lineHeight,
          color: resolvedColor,
          fontWeight: resolvedWeight,
        },
        style,
      ]}
      {...rest}
    />
  );
}
