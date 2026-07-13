import {
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/theme-context";
import { Text } from "./Text";

export interface ToggleProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  label: string;
  /** Palavra de estado quando ligado (ex.: "Ativado"), ja traduzida. */
  onLabel?: string;
  /** Palavra de estado quando desligado (ex.: "Desativado"), ja traduzida. */
  offLabel?: string;
  /** Padrao: `${label}, ${estado}` quando as palavras de estado sao fornecidas. */
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Interruptor liga/desliga acessivel. Anuncia o estado a tecnologia assistiva
 * via accessibilityRole="switch" + aria-checked (nao um "botao" generico); a
 * prop ARIA vira aria-checked no DOM (RNW) e accessibilityState no nativo (RN).
 * Alvo de toque >= 48dp, cores por token e anel de foco visivel do
 * sistema (:focus-visible na Web, foco nativo). Puro e dirigido por props - sem
 * regra de negocio nem i18n.
 */
export function Toggle({
  value,
  onValueChange,
  label,
  onLabel,
  offLabel,
  accessibilityLabel,
  testID,
  style,
}: ToggleProps) {
  const { colors, space, radii, ergonomics } = useTheme();

  const stateWord = value ? onLabel : offLabel;
  const resolvedA11yLabel =
    accessibilityLabel ?? [label, stateWord].filter(Boolean).join(", ");

  const trackHeight = 34;
  const thumbSize = 26;
  const inset = (trackHeight - thumbSize) / 2;

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={resolvedA11yLabel}
      aria-checked={value}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: space.md,
          minHeight: ergonomics.touchTargetMin,
          paddingVertical: space.sm,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text variant="body" style={{ flexShrink: 1 }}>
        {label}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
        {stateWord ? (
          <Text variant="label" color={value ? colors.accent : colors.inkSoft}>
            {stateWord}
          </Text>
        ) : null}
        <View
          style={{
            width: 60,
            height: trackHeight,
            borderRadius: radii.pill,
            borderWidth: 2,
            borderColor: value ? colors.accent : colors.line,
            backgroundColor: value ? colors.accent : colors.surface2,
            padding: inset,
            alignItems: value ? "flex-end" : "flex-start",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: thumbSize,
              height: thumbSize,
              borderRadius: radii.pill,
              backgroundColor: value ? colors.accentInk : colors.surface,
              borderWidth: value ? 0 : 2,
              borderColor: colors.line,
            }}
          />
        </View>
      </View>
    </Pressable>
  );
}
