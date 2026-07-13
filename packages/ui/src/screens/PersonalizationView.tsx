import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import {
  SegmentedControl,
  type SegmentedOption,
} from "../components/SegmentedControl";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";
import { Toggle } from "../components/Toggle";
import { Tour } from "../tour/Tour";
import { type TourControlsLabels } from "../tour/TourControls";

/**
 * Valores de dominio das preferencias, tipados estruturalmente aqui para manter
 * a UI desacoplada do core (o container passa os value objects equivalentes).
 */
type ContrastValue = "standard" | "high";
type SpacingValue = 1 | 1.25 | 1.5;
type NavigationValue = "simple" | "standard";

export interface PersonalizationTourViewModel {
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

export interface PersonalizationLabels {
  title: string;
  fontSize: string;
  fontSizeA11y: string;
  decreaseFontA11y: string;
  increaseFontA11y: string;
  contrast: string;
  contrastOptions: SegmentedOption<ContrastValue>[];
  spacing: string;
  spacingOptions: SegmentedOption<SpacingValue>[];
  simplification: string;
  navigationOptions: SegmentedOption<NavigationValue>[];
  reinforcedFeedback: string;
  extraConfirmations: string;
  on: string;
  off: string;
  // Provisorios (F10) e F08, preservados nesta tela ate a relocacao.
  restartTour: string;
  languageTitle: string;
  languageToggle: string;
  resetDefaults: string;
}

export interface PersonalizationViewValues {
  fontScale: number;
  atMin: boolean;
  atMax: boolean;
  contrastLevel: ContrastValue;
  spacingScale: SpacingValue;
  navigationMode: NavigationValue;
  reinforcedFeedback: boolean;
  extraConfirmations: boolean;
}

export interface PersonalizationViewProps {
  labels: PersonalizationLabels;
  values: PersonalizationViewValues;
  onDecreaseFont: () => void;
  onIncreaseFont: () => void;
  onContrastChange: (value: ContrastValue) => void;
  onSpacingChange: (value: SpacingValue) => void;
  onNavigationModeChange: (value: NavigationValue) => void;
  onReinforcedFeedbackChange: (value: boolean) => void;
  onExtraConfirmationsChange: (value: boolean) => void;
  onRestartTour: () => void;
  onToggleLanguage: () => void;
  onResetDefaults: () => void;
  tour: PersonalizationTourViewModel;
}

/**
 * Painel de Personalizacao (tela cross unica Web + Mobile). 100% apresentacional:
 * recebe copia traduzida e callbacks por props; nenhuma regra de negocio nem
 * i18n aqui dentro. Reune os seis controles de aparencia/interacao, hospeda o
 * tour guiado (F08) e preserva os controles provisorios de idioma/restauracao
 * (F10) ate que o Perfil os assuma.
 */
export function PersonalizationView(props: PersonalizationViewProps) {
  const {
    labels,
    values,
    onDecreaseFont,
    onIncreaseFont,
    onContrastChange,
    onSpacingChange,
    onNavigationModeChange,
    onReinforcedFeedbackChange,
    onExtraConfirmationsChange,
    onRestartTour,
    onToggleLanguage,
    onResetDefaults,
    tour,
  } = props;
  const { colors, space, radii } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="personalization-screen">
        <Text variant="heading" accessibilityRole="header">
          {labels.title}
        </Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.line,
            borderWidth: 2,
            borderRadius: radii.lg,
            padding: space.lg,
            gap: space.lg,
          }}
        >
          {/* Tamanho da fonte: A-/A+ com limites que desligam nos extremos */}
          <Stack gap="sm">
            <Text variant="body" accessibilityLabel={labels.fontSizeA11y}>
              {labels.fontSize}
            </Text>
            <Stack direction="row" gap="sm">
              <Button
                label="A-"
                variant="secondary"
                onPress={onDecreaseFont}
                disabled={values.atMin}
                accessibilityLabel={labels.decreaseFontA11y}
                testID="decrease-font"
                style={{ flexGrow: 1, flexBasis: 0 }}
              />
              <Button
                label="A+"
                variant="primary"
                onPress={onIncreaseFont}
                disabled={values.atMax}
                accessibilityLabel={labels.increaseFontA11y}
                testID="increase-font"
                style={{ flexGrow: 1, flexBasis: 0 }}
              />
            </Stack>
          </Stack>

          {/* Contraste */}
          <Stack gap="sm">
            <Text variant="body">{labels.contrast}</Text>
            <SegmentedControl
              options={labels.contrastOptions}
              value={values.contrastLevel}
              onChange={onContrastChange}
              accessibilityLabel={labels.contrast}
              testID="contrast"
            />
          </Stack>

          {/* Espacamento */}
          <Stack gap="sm">
            <Text variant="body">{labels.spacing}</Text>
            <SegmentedControl
              options={labels.spacingOptions}
              value={values.spacingScale}
              onChange={onSpacingChange}
              accessibilityLabel={labels.spacing}
              testID="spacing"
            />
          </Stack>

          {/* Simplificacao da interface */}
          <Stack gap="sm">
            <Text variant="body">{labels.simplification}</Text>
            <SegmentedControl
              options={labels.navigationOptions}
              value={values.navigationMode}
              onChange={onNavigationModeChange}
              accessibilityLabel={labels.simplification}
              testID="navigation-mode"
            />
          </Stack>

          {/* Feedback reforcado */}
          <Toggle
            label={labels.reinforcedFeedback}
            value={values.reinforcedFeedback}
            onValueChange={onReinforcedFeedbackChange}
            onLabel={labels.on}
            offLabel={labels.off}
            testID="toggle-reinforced-feedback"
          />

          {/* Confirmacoes extras */}
          <Toggle
            label={labels.extraConfirmations}
            value={values.extraConfirmations}
            onValueChange={onExtraConfirmationsChange}
            onLabel={labels.on}
            offLabel={labels.off}
            testID="toggle-extra-confirmations"
          />

          {/* Provisorios (F10): idioma + restaurar padroes */}
          <Stack gap="sm">
            <Text variant="body">{labels.languageTitle}</Text>
            <Button
              label={labels.languageToggle}
              variant="secondary"
              onPress={onToggleLanguage}
              testID="toggle-language"
            />
          </Stack>

          <Button
            label={labels.resetDefaults}
            variant="danger"
            onPress={onResetDefaults}
            testID="reset-defaults"
          />
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
