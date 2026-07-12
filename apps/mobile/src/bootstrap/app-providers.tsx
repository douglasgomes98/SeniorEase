import { useMemo, type ReactNode } from "react";
import { useFonts } from "expo-font";
import { AppShell, createAppStores } from "@senior-ease/features";
import { NativeStorage } from "./native-storage";

/**
 * Composition root do Mobile: injeta o adaptador AsyncStorage, carrega as fontes
 * auto-hospedadas (Atkinson Hyperlegible + Material Symbols Rounded) e monta o
 * AppShell (stores + i18n + tema). Segura o render ate as fontes ficarem
 * prontas, garantindo a tipografia de baixa visao ja no primeiro paint.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const stores = useMemo(() => createAppStores(new NativeStorage()), []);
  const [fontsLoaded] = useFonts({
    "Atkinson Hyperlegible": require("../../assets/fonts/AtkinsonHyperlegible-Regular.ttf"),
    "Material Symbols Rounded": require("../../assets/fonts/MaterialSymbolsRounded.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return <AppShell stores={stores}>{children}</AppShell>;
}
