import { useTranslation } from "@senior-ease/i18n";
import { ModulePlaceholderView } from "@senior-ease/ui";

/**
 * Placeholder do Perfil. A tela real chega depois; aqui o shell ja hospeda a
 * rota com copia traduzida e um alvo de navegacao previsivel.
 */
export function ProfileScreen() {
  const t = useTranslation();
  return (
    <ModulePlaceholderView
      testID="profile-screen"
      title={t("nav.destination.profile.label")}
      body={t("placeholder.comingSoon")}
    />
  );
}
