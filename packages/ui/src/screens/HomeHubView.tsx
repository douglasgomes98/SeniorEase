import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { DestinationCard } from "../components/DestinationCard";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";

export interface HubDestination {
  route: string;
  title: string;
  description: string;
  onPress: () => void;
}

export interface HubResume {
  label: string;
  onPress: () => void;
}

export interface HomeHubViewProps {
  title: string;
  subtitle: string;
  destinations: HubDestination[];
  /** Afordancia "continuar de onde parou"; ausente quando nao ha o que retomar. */
  resume: HubResume | null;
  testID?: string;
}

/**
 * Hub de destinos da Home. Renderiza os cartoes na ordem recebida e, quando ha
 * um ultimo modulo, oferece a retomada em um toque. 100% apresentacional: sem
 * regra de negocio nem i18n aqui dentro.
 */
export function HomeHubView({
  title,
  subtitle,
  destinations,
  resume,
  testID,
}: HomeHubViewProps) {
  const { colors, space, radii } = useTheme();

  return (
    <Screen testID={testID ?? "home-hub"}>
      <Stack gap="sm">
        <Text variant="heading" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="body" muted>
          {subtitle}
        </Text>
      </Stack>

      {resume ? (
        <View
          accessibilityRole="summary"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.accent,
            borderWidth: 2,
            borderRadius: radii.lg,
            padding: space.md,
          }}
        >
          <Button
            label={resume.label}
            variant="primary"
            onPress={resume.onPress}
            testID="home-resume"
          />
        </View>
      ) : null}

      <Stack gap="md">
        {destinations.map((destination) => (
          <DestinationCard
            key={destination.route}
            title={destination.title}
            description={destination.description}
            onPress={destination.onPress}
            testID={`destination-${destination.route}`}
          />
        ))}
      </Stack>
    </Screen>
  );
}
