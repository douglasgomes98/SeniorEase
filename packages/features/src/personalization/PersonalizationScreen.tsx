import { useEffect } from "react";
import { useFeedback, usePreferences, useTour } from "@senior-ease/core";
import {
  nextLocale,
  useTranslation,
  type MessageKey,
} from "@senior-ease/i18n";
import { HomeScreenView, type HomeScreenViewProps } from "@senior-ease/ui";
import { tourStepContent } from "../home/tour-config";

/**
 * Placeholder da Personalizacao, hospedado pelo shell ate o painel real chegar.
 * Preserva intacto o demo atual de fonte/contraste/idioma + o tour guiado; as
 * regras de negocio permanecem no core.
 */
export function PersonalizationScreen() {
  const t = useTranslation();

  const locale = usePreferences((state) => state.locale);
  const fontScale = usePreferences((state) => state.fontScale);
  const contrastLevel = usePreferences((state) => state.contrastLevel);
  const isHydrated = usePreferences((state) => state.isHydrated);
  const tourCompleted = usePreferences((state) => state.tourCompleted);
  const increaseFontScale = usePreferences((state) => state.increaseFontScale);
  const decreaseFontScale = usePreferences((state) => state.decreaseFontScale);
  const toggleContrast = usePreferences((state) => state.toggleContrast);
  const setLocale = usePreferences((state) => state.setLocale);
  const announce = useFeedback((state) => state.announce);

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

  // Demonstracao do mecanismo de feedback: cada acao de personalizacao muda o
  // estado e confirma via announce, com copy positiva e traduzida. Ate o painel
  // real (F07) assumir estas acoes, este e o consumidor de referencia do F05.
  const handleIncreaseFont = () => {
    increaseFontScale();
    announce(t("feedback.fontSize"));
  };
  const handleDecreaseFont = () => {
    decreaseFontScale();
    announce(t("feedback.fontSize"));
  };
  const handleToggleContrast = () => {
    toggleContrast();
    announce(t("feedback.contrast"));
  };
  const handleToggleLanguage = () => {
    setLocale(upcomingLocale);
    announce(t("feedback.language"));
  };

  const labels: HomeScreenViewProps["labels"] = {
    appName: "SeniorEase",
    greeting: t("home.greeting"),
    personalizationTitle: t("home.personalization.title"),
    fontSize: t("home.personalization.fontSize", { percent: fontScalePercent }),
    fontSizeA11y: t("home.personalization.fontSizeA11y", {
      percent: fontScalePercent,
    }),
    decreaseFontA11y: t("home.personalization.decreaseFontA11y"),
    increaseFontA11y: t("home.personalization.increaseFontA11y"),
    contrast: t("home.personalization.contrast", { level: contrastName }),
    contrastToggle: t("home.personalization.contrastToggle"),
    languageTitle: t("home.language.title"),
    languageToggle: t("home.language.toggle", { language: upcomingLanguageName }),
    restartTour: t("home.restartTour"),
  };

  return (
    <HomeScreenView
      labels={labels}
      onIncreaseFont={handleIncreaseFont}
      onDecreaseFont={handleDecreaseFont}
      onToggleContrast={handleToggleContrast}
      onToggleLanguage={handleToggleLanguage}
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
