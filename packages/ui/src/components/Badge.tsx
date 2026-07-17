import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Text } from "./Text";

/**
 * Tom do rotulo. O sistema de design entrega os papeis accent/success/danger;
 * como nao ha um papel dedicado de "warning", ele reusa a familia danger de
 * forma suave (atencao sem ser o mais forte). A UI e apenas apresentacional e
 * nao depende do dominio.
 */
export type BadgeTone = "info" | "warning" | "danger";

export interface BadgeProps {
  /** Rotulo ja traduzido; renderizado apenas como texto (sem markup). */
  label: string;
  tone: BadgeTone;
  testID?: string;
}

/**
 * Etiqueta compacta (pilula) para status como "chegando"/"atrasada". Cores vem
 * apenas dos papeis do design system, nunca hex, entao o contraste AA/AAA
 * vale nas duas paletas. Puro e dirigido por props - sem regra de negocio nem
 * i18n aqui dentro.
 */
export function Badge({ label, tone, testID }: BadgeProps) {
  const { colors, space, radii } = useTheme();

  const TONES: Record<BadgeTone, { bg: string; fg: string }> = {
    info: { bg: colors.accentSoft, fg: colors.accent },
    warning: { bg: colors.dangerSoft, fg: colors.danger },
    danger: { bg: colors.danger, fg: colors.dangerInk },
  };
  const { bg, fg } = TONES[tone];

  return (
    <View
      testID={testID}
      style={{
        alignSelf: "flex-start",
        backgroundColor: bg,
        borderRadius: radii.pill,
        paddingVertical: space.xs,
        paddingHorizontal: space.sm,
      }}
    >
      <Text variant="caption" weight="bold" color={fg}>
        {label}
      </Text>
    </View>
  );
}
