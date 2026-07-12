import { useEffect, type ReactNode } from "react";
import {
  StoresProvider,
  useNavigation,
  usePreferences,
  type AppStores,
} from "@senior-ease/core";
import { I18nProvider } from "@senior-ease/i18n";
import { ThemeProvider } from "@senior-ease/ui";

function Localized({ children }: { children: ReactNode }) {
  const hydrate = usePreferences((state) => state.hydrate);
  const hydrateNavigation = useNavigation((state) => state.hydrate);
  const locale = usePreferences((state) => state.locale);
  const contrast = usePreferences((state) => state.contrastLevel);
  const fontScale = usePreferences((state) => state.fontScale);

  useEffect(() => {
    void hydrate();
    void hydrateNavigation();
  }, [hydrate, hydrateNavigation]);

  return (
    <I18nProvider locale={locale}>
      <ThemeProvider contrast={contrast} fontScale={fontScale}>
        {children}
      </ThemeProvider>
    </I18nProvider>
  );
}

export interface AppShellProps {
  stores: AppStores;
  children: ReactNode;
}

/**
 * Shell compartilhado (Web + Mobile): fornece as stores, hidrata as
 * preferencias persistidas e alimenta i18n e tema a partir delas. As apps so
 * precisam construir as stores com o adaptador de storage da plataforma.
 */
export function AppShell({ stores, children }: AppShellProps) {
  return (
    <StoresProvider stores={stores}>
      <Localized>{children}</Localized>
    </StoresProvider>
  );
}
