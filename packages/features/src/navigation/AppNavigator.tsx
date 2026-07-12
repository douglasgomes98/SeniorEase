import { useEffect } from "react";
import { BackHandler, Platform, View } from "react-native";
import { useNavigation, type AppRoute } from "@senior-ease/core";
import { useTranslation, type MessageKey } from "@senior-ease/i18n";
import { AppHeader } from "@senior-ease/ui";
import { screenRegistry } from "./screen-registry";

/** Titulo de cada tela no cabecalho (home usa o proprio titulo do inicio). */
const TITLE_KEYS: Record<AppRoute, MessageKey> = {
  home: "nav.title.home",
  activities: "nav.destination.activities.label",
  personalization: "nav.destination.personalization.label",
  profile: "nav.destination.profile.label",
};

/**
 * Host de navegacao (compartilhado Web + Mobile). Le a store de rotas, renderiza
 * o cabecalho do shell + a tela ativa do registro, e conecta o voltar do
 * hardware (Android) a acao back. O voltar da tela e a afordancia canonica.
 */
export function AppNavigator() {
  const t = useTranslation();
  const current = useNavigation((state) => state.current);
  const canGoBack = useNavigation((state) => state.canGoBack);
  const back = useNavigation((state) => state.back);

  useEffect(() => {
    // Voltar por hardware so existe no Android; em Web/iOS o unico voltar e o
    // controle na tela, entao nem registramos o handler.
    if (Platform.OS !== "android") {
      return;
    }
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack) {
        back();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [canGoBack, back]);

  const ActiveScreen = screenRegistry[current];

  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        title={t(TITLE_KEYS[current])}
        showBack={canGoBack}
        backLabel={t("nav.back")}
        onBack={back}
      />
      <View style={{ flex: 1 }}>
        <ActiveScreen />
      </View>
    </View>
  );
}
