import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";
import { Tour } from "../tour/Tour";
import { type TourControlsLabels } from "../tour/TourControls";

export interface HomeTourViewModel {
  active: boolean;
  title: string;
  description: string;
  isFirst: boolean;
  isLast: boolean;
  labels: TourControlsLabels;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export interface HomeScreenLabels {
  appName: string;
  greeting: string;
  personalizationTitle: string;
  fontSize: string;
  fontSizeA11y: string;
  decreaseFontA11y: string;
  increaseFontA11y: string;
  contrast: string;
  contrastToggle: string;
  languageTitle: string;
  languageToggle: string;
  restartTour: string;
}

export interface HomeScreenViewProps {
  labels: HomeScreenLabels;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  onToggleContrast: () => void;
  onToggleLanguage: () => void;
  onRestartTour: () => void;
  tour: HomeTourViewModel;
}

/**
 * Tela cross unica (Web + Mobile). 100% apresentacional: recebe copia traduzida
 * e callbacks por props; nenhuma regra de negocio nem i18n aqui dentro. Exercita
 * o Painel de Personalizacao (fonte, contraste, idioma) e o Tour guiado.
 */
export function HomeScreenView(props: HomeScreenViewProps) {
  const {
    labels,
    onIncreaseFont,
    onDecreaseFont,
    onToggleContrast,
    onToggleLanguage,
    onRestartTour,
    tour,
  } = props;
  const { colors, space, radii } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="home-screen">
        <Stack gap="sm">
          <Text variant="heading" accessibilityRole="header">
            {labels.appName}
          </Text>
          <Text variant="body" muted>
            {labels.greeting}
          </Text>
        </Stack>

        <View
          accessibilityRole="summary"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.line,
            borderWidth: 2,
            borderRadius: radii.lg,
            padding: space.lg,
            gap: space.lg,
          }}
        >
          <Text variant="title">{labels.personalizationTitle}</Text>

          <Stack gap="sm">
            <Text variant="body" accessibilityLabel={labels.fontSizeA11y}>
              {labels.fontSize}
            </Text>
            <Stack direction="row" gap="sm">
              <Button
                label="A-"
                variant="secondary"
                onPress={onDecreaseFont}
                accessibilityLabel={labels.decreaseFontA11y}
                testID="decrease-font"
                style={{ flexGrow: 1, flexBasis: 0 }}
              />
              <Button
                label="A+"
                variant="primary"
                onPress={onIncreaseFont}
                accessibilityLabel={labels.increaseFontA11y}
                testID="increase-font"
                style={{ flexGrow: 1, flexBasis: 0 }}
              />
            </Stack>
          </Stack>

          <Stack gap="sm">
            <Text variant="body">{labels.contrast}</Text>
            <Button
              label={labels.contrastToggle}
              variant="secondary"
              onPress={onToggleContrast}
              testID="toggle-contrast"
            />
          </Stack>

          <Stack gap="sm">
            <Text variant="body">{labels.languageTitle}</Text>
            <Button
              label={labels.languageToggle}
              variant="secondary"
              onPress={onToggleLanguage}
              testID="toggle-language"
            />
          </Stack>
        </View>

        <Button
          label={labels.restartTour}
          variant="ghost"
          onPress={onRestartTour}
          testID="restart-tour"
        />
      </Screen>

      <Tour
        active={tour.active}
        title={tour.title}
        description={tour.description}
        isFirst={tour.isFirst}
        isLast={tour.isLast}
        labels={tour.labels}
        onPrevious={tour.onPrevious}
        onNext={tour.onNext}
        onSkip={tour.onSkip}
      />
    </View>
  );
}
