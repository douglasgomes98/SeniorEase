import {
  createContext,
  createElement,
  useContext,
  type ReactNode,
} from "react";
import type { PreferencesState, PreferencesStore } from "./preferences-store";
import type { TourState, TourStore } from "./tour-store";
import type { NavigationState, NavigationStore } from "./navigation-store";

/**
 * Contexto de injecao das stores. Cada plataforma cria as stores no seu
 * composition root (com o adaptador de storage correto) e as fornece aqui.
 * Componentes consomem via os hooks abaixo, sem conhecer a plataforma.
 */
export interface AppStores {
  preferences: PreferencesStore;
  tour: TourStore;
  navigation: NavigationStore;
}

const StoresContext = createContext<AppStores | null>(null);

export interface StoresProviderProps {
  stores: AppStores;
  children: ReactNode;
}

export function StoresProvider({
  stores,
  children,
}: StoresProviderProps): ReactNode {
  return createElement(StoresContext.Provider, { value: stores }, children);
}

function useStores(): AppStores {
  const stores = useContext(StoresContext);
  if (!stores) {
    throw new Error("useStores deve ser usado dentro de StoresProvider.");
  }
  return stores;
}

export function usePreferences<T>(selector: (state: PreferencesState) => T): T {
  return useStores().preferences(selector);
}

export function useTour<T>(selector: (state: TourState) => T): T {
  return useStores().tour(selector);
}

export function useNavigation<T>(selector: (state: NavigationState) => T): T {
  return useStores().navigation(selector);
}
