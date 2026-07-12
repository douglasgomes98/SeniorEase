import { Screen } from "../components/Screen";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";

export interface ModulePlaceholderViewProps {
  title: string;
  body: string;
  testID?: string;
}

/**
 * Placeholder "em breve" reutilizavel para modulos que serao substituidos por
 * suas telas reais depois. Puramente apresentacional, dirigido por props.
 */
export function ModulePlaceholderView({
  title,
  body,
  testID,
}: ModulePlaceholderViewProps) {
  return (
    <Screen testID={testID ?? "module-placeholder"}>
      <Stack gap="md">
        <Text variant="heading" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="body" muted>
          {body}
        </Text>
      </Stack>
    </Screen>
  );
}
