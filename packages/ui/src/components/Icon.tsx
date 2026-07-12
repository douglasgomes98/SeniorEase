import { Text as RNText, type TextStyle } from "react-native";
import { useTheme } from "../theme/theme-context";

export interface IconProps {
  /** Nome do glifo Material Symbols Rounded (ex.: "home", "person"). */
  name: string;
  /** Tamanho do glifo; por padrao acompanha o tamanho de titulo do tema. */
  size?: number;
  /** Cor do glifo; por padrao a tinta principal do tema. */
  color?: string;
  style?: TextStyle;
  testID?: string;
}

/**
 * Glifo de icone (Material Symbols Rounded) sempre DECORATIVO: nao expoe nome
 * acessivel proprio. Deve ser composto ao lado de um rotulo de texto visivel,
 * que carrega o significado - nunca existe afordancia so-de-icone. Puro,
 * dirigido por props.
 */
export function Icon({ name, size, color, style, testID }: IconProps) {
  const theme = useTheme();
  const glyphSize = size ?? theme.font.title;

  return (
    <RNText
      testID={testID}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          fontFamily: theme.iconFontFamily,
          fontSize: glyphSize,
          lineHeight: glyphSize,
          color: color ?? theme.colors.ink,
        },
        style,
      ]}
    >
      {name}
    </RNText>
  );
}
