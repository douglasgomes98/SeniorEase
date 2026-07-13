import { useEffect } from "react";
import {
  isFontScaleAtMax,
  isFontScaleAtMin,
  useConfirm,
  useFeedback,
  usePreferences,
  useTour,
  type ContrastLevel,
  type NavigationMode,
  type SpacingScale,
} from "@senior-ease/core";
import {
  nextLocale,
  useTranslation,
  type MessageKey,
} from "@senior-ease/i18n";
import {
  PersonalizationView,
  type PersonalizationViewProps,
} from "@senior-ease/ui";
import { tourStepContent } from "../home/tour-config";

/**
 * Container do Painel de Personalizacao. Le as seis preferencias de
 * aparencia/interacao (F03) e os limites de fonte, aciona cada setter que
 * persiste e confirma a mudanca via feedback (F05). Resolve toda a copia por
 * i18n e a entrega, junto do tour (F08) e dos controles provisorios de
 * idioma/restauracao (F10), a view apresentacional. As regras vivem no core.
 */
export function PersonalizationScreen() {
  const t = useTranslation();

  const locale = usePreferences((state) => state.locale);
  const fontScale = usePreferences((state) => state.fontScale);
  const contrastLevel = usePreferences((state) => state.contrastLevel);
  const spacingScale = usePreferences((state) => state.spacingScale);
  const navigationMode = usePreferences((state) => state.navigationMode);
  const reinforcedFeedback = usePreferences((state) => state.reinforcedFeedback);
  const extraConfirmations = usePreferences((state) => state.extraConfirmations);
  const isHydrated = usePreferences((state) => state.isHydrated);
  const tourCompleted = usePreferences((state) => state.tourCompleted);

  const increaseFontScale = usePreferences((state) => state.increaseFontScale);
  const decreaseFontScale = usePreferences((state) => state.decreaseFontScale);
  const toggleContrast = usePreferences((state) => state.toggleContrast);
  const setSpacingScale = usePreferences((state) => state.setSpacingScale);
  const setNavigationMode = usePreferences((state) => state.setNavigationMode);
  const setReinforcedFeedback = usePreferences(
    (state) => state.setReinforcedFeedback,
  );
  const setExtraConfirmations = usePreferences(
    (state) => state.setExtraConfirmations,
  );
  const setLocale = usePreferences((state) => state.setLocale);
  const resetToDefaults = usePreferences((state) => state.resetToDefaults);
  const announce = useFeedback((state) => state.announce);
  const confirm = useConfirm();

  const steps = useTour((state) => state.steps);
  const progress = useTour((state) => state.progress);
  const beginTour = useTour((state) => state.begin);
  const nextStep = useTour((state) => state.next);
  const previousStep = useTour((state) => state.previous);
  const skipTour = useTour((state) => state.skip);

  useEffect(() => {
    if (
      isHydrated &&
      !tourCompleted &&
      !progress.isActive &&
      !progress.finished
    ) {
      beginTour();
    }
  }, [isHydrated, tourCompleted, progress.isActive, progress.finished, beginTour]);

  const fontScalePercent = Math.round(fontScale * 100);
  const contrastName = t(
    contrastLevel === "high" ? "home.contrast.high" : "home.contrast.standard",
  );

  const currentStep = steps[progress.currentIndex] ?? null;
  const content = currentStep ? tourStepContent(currentStep.id) : null;
  const isFirst = progress.currentIndex <= 0;
  const isLast = progress.currentIndex >= progress.totalSteps - 1;

  const upcomingLocale = nextLocale(locale);
  const upcomingLanguageKey: MessageKey = `language.name.${upcomingLocale}`;
  const upcomingLanguageName = t(upcomingLanguageKey);

  // Fonte: sobe/desce em passos de 15% e confirma. Os limites desligam os botoes
  // na view (atMin/atMax), entao no piso/teto nada dispara.
  const handleIncreaseFont = () => {
    increaseFontScale();
    announce(t("feedback.fontSize"));
  };
  const handleDecreaseFont = () => {
    decreaseFontScale();
    announce(t("feedback.fontSize"));
  };
  // Contraste vem como escolha de duas opcoes; o dominio expoe apenas o toggle
  // binario, entao so alternamos (e confirmamos) quando a selecao muda.
  const handleContrastChange = (value: ContrastLevel) => {
    if (value === contrastLevel) {
      return;
    }
    toggleContrast();
    announce(t("feedback.contrast"));
  };
  const handleSpacingChange = (value: SpacingScale) => {
    if (value === spacingScale) {
      return;
    }
    setSpacingScale(value);
    announce(t("feedback.spacing"));
  };
  const handleNavigationModeChange = (value: NavigationMode) => {
    if (value === navigationMode) {
      return;
    }
    setNavigationMode(value);
    announce(t("feedback.navigationMode"));
  };
  const handleReinforcedFeedbackChange = (value: boolean) => {
    setReinforcedFeedback(value);
    announce(t("feedback.reinforcedFeedback"));
  };
  const handleExtraConfirmationsChange = (value: boolean) => {
    setExtraConfirmations(value);
    announce(t("feedback.extraConfirmations"));
  };
  const handleToggleLanguage = () => {
    setLocale(upcomingLocale);
    announce(t("feedback.language"));
  };
  // Portao de confirmacao numa acao destrutiva provisoria (F10, a caminho do
  // Perfil): confirmado -> reseta e confirma; cancelado -> nada muda. Com as
  // confirmacoes extras desligadas, o portao resolve direto e a acao segue.
  const handleResetDefaults = async () => {
    const confirmed = await confirm({
      title: t("confirm.resetDefaults.title"),
      message: t("confirm.resetDefaults.message"),
      confirmLabel: t("confirm.resetDefaults.confirm"),
      cancelLabel: t("common.cancel"),
      tone: "danger",
    });
    if (!confirmed) {
      return;
    }
    resetToDefaults();
    announce(t("feedback.resetDefaults"));
  };

  const contrastOptions: { value: ContrastLevel; label: string }[] = [
    { value: "standard", label: t("home.contrast.standard") },
    { value: "high", label: t("home.contrast.high") },
  ];
  const spacingOptions: { value: SpacingScale; label: string }[] = [
    { value: 1.0, label: t("home.spacing.compact") },
    { value: 1.25, label: t("home.spacing.comfortable") },
    { value: 1.5, label: t("home.spacing.spacious") },
  ];
  const navigationOptions: { value: NavigationMode; label: string }[] = [
    { value: "simple", label: t("home.navigation.simple") },
    { value: "standard", label: t("home.navigation.standard") },
  ];

  const labels: PersonalizationViewProps["labels"] = {
    title: t("home.personalization.title"),
    fontSize: t("home.personalization.fontSize", { percent: fontScalePercent }),
    fontSizeA11y: t("home.personalization.fontSizeA11y", {
      percent: fontScalePercent,
    }),
    decreaseFontA11y: t("home.personalization.decreaseFontA11y"),
    increaseFontA11y: t("home.personalization.increaseFontA11y"),
    contrast: t("home.personalization.contrast", { level: contrastName }),
    contrastOptions,
    spacing: t("home.personalization.spacing"),
    spacingOptions,
    simplification: t("home.personalization.simplification"),
    navigationOptions,
    reinforcedFeedback: t("home.personalization.reinforcedFeedback"),
    extraConfirmations: t("home.personalization.extraConfirmations"),
    on: t("common.on"),
    off: t("common.off"),
    restartTour: t("home.restartTour"),
    languageTitle: t("home.language.title"),
    languageToggle: t("home.language.toggle", { language: upcomingLanguageName }),
    resetDefaults: t("home.personalization.resetDefaults"),
  };

  const values: PersonalizationViewProps["values"] = {
    fontScale,
    atMin: isFontScaleAtMin(fontScale),
    atMax: isFontScaleAtMax(fontScale),
    contrastLevel,
    spacingScale,
    navigationMode,
    reinforcedFeedback,
    extraConfirmations,
  };

  return (
    <PersonalizationView
      labels={labels}
      values={values}
      onIncreaseFont={handleIncreaseFont}
      onDecreaseFont={handleDecreaseFont}
      onContrastChange={handleContrastChange}
      onSpacingChange={handleSpacingChange}
      onNavigationModeChange={handleNavigationModeChange}
      onReinforcedFeedbackChange={handleReinforcedFeedbackChange}
      onExtraConfirmationsChange={handleExtraConfirmationsChange}
      onToggleLanguage={handleToggleLanguage}
      onResetDefaults={handleResetDefaults}
      onRestartTour={beginTour}
      tour={{
        active: progress.isActive,
        title: content ? t(content.titleKey) : "",
        description: content ? t(content.descriptionKey) : "",
        isFirst,
        isLast,
        labels: {
          step: t("tour.controls.step", {
            current: Math.min(progress.currentIndex + 1, progress.totalSteps),
            total: progress.totalSteps,
          }),
          previous: t("tour.controls.previous"),
          next: t("tour.controls.next"),
          finish: t("tour.controls.finish"),
          skip: t("tour.controls.skip"),
        },
        onPrevious: previousStep,
        onNext: nextStep,
        onSkip: skipTour,
      }}
    />
  );
}
