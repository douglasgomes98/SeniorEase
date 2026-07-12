import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { spacing } from "../tokens";
import { Button } from "../components/Button";
import { Text } from "../components/Text";

export interface AppHeaderProps {
  title: string;
  /** Mostra o controle de voltar apenas fora da raiz. */
  showBack: boolean;
  backLabel: string;
  onBack: () => void;
  testID?: string;
}

/**
 * Barra superior do shell (identica em Web e Mobile). Titulo da tela e, fora da
 * raiz, um controle de voltar unico, discoverable e com alvo amplo. Puramente
 * apresentacional, dirigido por props.
 */
export function AppHeader({
  title,
  showBack,
  backLabel,
  onBack,
  testID,
}: AppHeaderProps) {
  const { palette } = useTheme();

  return (
    <View
      testID={testID}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: palette.background,
        borderBottomWidth: 2,
        borderBottomColor: palette.border,
      }}
    >
      {showBack ? (
        <Button
          label={backLabel}
          variant="secondary"
          onPress={onBack}
          testID="app-header-back"
        />
      ) : null}
      <Text
        variant="title"
        accessibilityRole="header"
        style={{ flexShrink: 1 }}
      >
        {title}
      </Text>
    </View>
  );
}
