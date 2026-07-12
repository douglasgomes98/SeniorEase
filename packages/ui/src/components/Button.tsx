import {
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/theme-context";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "ghost";
/** default -> controlHeight (52); large -> controlHeightLg (60); piso 48dp. */
export type ButtonSize = "default" | "large";

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Botao acessivel: altura de controle confortavel sobre o piso de toque de 48dp,
 * papel e rotulo para leitores de tela e feedback visual ao pressionar. O anel
 * de foco visivel vem do sistema (:focus-visible na Web, foco nativo). Puro e
 * dirigido por props.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "default",
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: ButtonProps) {
  const { colors, ergonomics, space, radii } = useTheme();

  const backgroundColor =
    variant === "primary"
      ? colors.accent
      : variant === "secondary"
        ? colors.surface
        : "transparent";
  const borderColor = variant === "secondary" ? colors.line : "transparent";
  const labelColor =
    variant === "primary"
      ? colors.accentInk
      : variant === "ghost"
        ? colors.accent
        : colors.ink;

  const controlHeight =
    size === "large" ? ergonomics.controlHeightLg : ergonomics.controlHeight;
  const minHeight = Math.max(controlHeight, ergonomics.touchTargetMin);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          minHeight,
          minWidth: ergonomics.touchTargetMin,
          paddingVertical: space.md,
          paddingHorizontal: space.xl,
          borderRadius: radii.md,
          borderWidth: 2,
          borderColor,
          backgroundColor,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text variant="label" weight="bold" color={labelColor} style={{ textAlign: "center" }}>
        {label}
      </Text>
    </Pressable>
  );
}
