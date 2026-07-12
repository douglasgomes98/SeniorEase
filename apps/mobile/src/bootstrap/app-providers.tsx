import { useMemo, type ReactNode } from "react";
import { AppShell, createAppStores } from "@senior-ease/features";
import { NativeStorage } from "./native-storage";

/**
 * Composition root do Mobile: injeta o adaptador AsyncStorage e monta o
 * AppShell (stores + i18n + tema). Criado uma unica vez por execucao do app.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const stores = useMemo(() => createAppStores(new NativeStorage()), []);
  return <AppShell stores={stores}>{children}</AppShell>;
}
