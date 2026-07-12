import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";

export interface TourCoachmarkProps {
  title: string;
  description: string;
}

/**
 * Balao do tour: titulo e descricao em linguagem clara e texto ampliado.
 * Puro, dirigido por props.
 */
export function TourCoachmark({ title, description }: TourCoachmarkProps) {
  const { colors, space, radii } = useTheme();

  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${description}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.line,
        borderWidth: 2,
        borderRadius: radii.lg,
        padding: space.xl,
      }}
    >
      <Stack gap="sm">
        <Text variant="title">{title}</Text>
        <Text variant="body" muted>
          {description}
        </Text>
      </Stack>
    </View>
  );
}
