import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Stack } from "./Stack";
import { Text } from "./Text";

export interface DestinationCardProps {
  title: string;
  description: string;
  onPress: () => void;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Cartao de destino grande e claramente rotulado (hub da Home). Alvo de toque
 * amplo (>= 48dp), papel e rotulo para leitores de tela e realce visivel ao
 * focar/pressionar. Puro e dirigido por props - sem regra de negocio nem i18n.
 */
export function DestinationCard({
  title,
  description,
  onPress,
  accessibilityHint,
  testID,
  style,
}: DestinationCardProps) {
  const { colors, space, radii, ergonomics } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint ?? description}
      style={({ pressed }) => [
        {
          minHeight: ergonomics.touchTargetMin,
          padding: space.lg,
          borderRadius: radii.lg,
          borderWidth: 2,
          borderColor: colors.line,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Stack gap="xs">
        <Text variant="title">{title}</Text>
        <Text variant="body" muted>
          {description}
        </Text>
      </Stack>
    </Pressable>
  );
}
