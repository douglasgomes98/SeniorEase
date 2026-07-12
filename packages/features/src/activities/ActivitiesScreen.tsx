import { useTranslation } from "@senior-ease/i18n";
import { ModulePlaceholderView } from "@senior-ease/ui";

/**
 * Placeholder das Atividades. A lista real chega depois; aqui o shell ja
 * hospeda a rota com copia traduzida e um alvo de navegacao previsivel.
 */
export function ActivitiesScreen() {
  const t = useTranslation();
  return (
    <ModulePlaceholderView
      testID="activities-screen"
      title={t("nav.destination.activities.label")}
      body={t("placeholder.comingSoon")}
    />
  );
}
