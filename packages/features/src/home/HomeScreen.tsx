import { usePreferences, useNavigation, visibleRoutes } from "@senior-ease/core";
import { useTranslation } from "@senior-ease/i18n";
import { HomeHubView, type HubDestination } from "@senior-ease/ui";
import { DESTINATIONS, destinationLabelKey } from "../navigation/destinations";

/**
 * Container da Home como hub de destinos (compartilhado Web + Mobile). Liga o
 * catalogo ordenado + o modo de navegacao (core) e a traducao (i18n) a tela
 * apresentacional (ui). A unica logica aqui e orquestracao/derivacao - a regra
 * de visibilidade dos destinos vive no core.
 */
export function HomeScreen() {
  const t = useTranslation();
  const navigationMode = usePreferences((state) => state.navigationMode);
  const navigate = useNavigation((state) => state.navigate);
  const resume = useNavigation((state) => state.resume);
  const lastModule = useNavigation((state) => state.lastModule);

  const visible = new Set(visibleRoutes(navigationMode, DESTINATIONS));
  const destinations: HubDestination[] = DESTINATIONS.filter((entry) =>
    visible.has(entry.route),
  ).map((entry) => ({
    route: entry.route,
    title: t(entry.labelKey),
    description: t(entry.descriptionKey),
    onPress: () => navigate(entry.route),
  }));

  const resumeLabelKey = lastModule ? destinationLabelKey(lastModule) : null;
  const resumeAffordance =
    lastModule && resumeLabelKey
      ? {
          label: t("nav.home.resume", { destination: t(resumeLabelKey) }),
          onPress: resume,
        }
      : null;

  return (
    <HomeHubView
      title="SeniorEase"
      subtitle={t("home.hub.subtitle")}
      destinations={destinations}
      resume={resumeAffordance}
    />
  );
}
