import {
  Pressable,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/theme-context";
import { Text } from "./Text";

export interface SegmentedOption<V extends string | number> {
  value: V;
  /** Rotulo ja traduzido. */
  label: string;
}

export interface SegmentedControlProps<V extends string | number> {
  options: SegmentedOption<V>[];
  value: V;
  onChange: (next: V) => void;
  /** Rotulo do grupo, ja traduzido (anunciado ao leitor de tela). */
  accessibilityLabel: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Grupo de escolha unica acessivel. O contorno tem accessibilityRole="radiogroup"
 * e cada opcao "radio" + aria-checked (estado ARIA correto do radio), entao o
 * leitor de tela anuncia "uma de N" e a selecao; a prop ARIA vira aria-checked
 * no DOM (RNW) e accessibilityState no nativo (RN). Opcoes de largura igual,
 * alvo de toque >= 48dp
 * e destaque da selecao por token (accent/accentInk vs surface/ink). Puro e
 * dirigido por props - sem regra de negocio nem i18n.
 */
export function SegmentedControl<V extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
  testID,
  style,
}: SegmentedControlProps<V>) {
  const { colors, space, radii, ergonomics } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width <= 600;

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[
        {
          flexDirection: isCompact ? "column" : "row",
          flexWrap: "wrap",
          gap: space.sm,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            testID={testID ? `${testID}-${option.value}` : undefined}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            aria-checked={selected}
            style={({ pressed }) => ({
              flexGrow: isCompact ? 0 : 1,
              width: isCompact ? "100%" : undefined,
              minHeight: ergonomics.touchTargetMin,
              paddingVertical: space.md,
              paddingHorizontal: space.md,
              borderRadius: radii.md,
              borderWidth: 2,
              borderColor: selected ? colors.accent : colors.line,
              backgroundColor: selected ? colors.accent : colors.surface,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text
              variant="label"
              weight={selected ? "bold" : "medium"}
              color={selected ? colors.accentInk : colors.ink}
              style={{ textAlign: "center" }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
