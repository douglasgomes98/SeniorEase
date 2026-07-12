import {
  createContext,
  createElement,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import type { PreferencesState, PreferencesStore } from "./preferences-store";
import type { TourState, TourStore } from "./tour-store";
import type { NavigationState, NavigationStore } from "./navigation-store";
import type { ActivitiesState, ActivitiesStore } from "./activities-store";
import type { FeedbackState, FeedbackStore } from "./feedback-store";
import type {
  ConfirmationState,
  ConfirmationStore,
} from "./confirmation-store";
import { shouldConfirm, type ConfirmationRequest } from "../domain/confirmation";

/**
 * Contexto de injecao das stores. Cada plataforma cria as stores no seu
 * composition root (com o adaptador de storage correto) e as fornece aqui.
 * Componentes consomem via os hooks abaixo, sem conhecer a plataforma.
 */
export interface AppStores {
  preferences: PreferencesStore;
  tour: TourStore;
  navigation: NavigationStore;
  activities: ActivitiesStore;
  feedback: FeedbackStore;
  confirmation: ConfirmationStore;
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

export function useActivities<T>(selector: (state: ActivitiesState) => T): T {
  return useStores().activities(selector);
}

export function useFeedback<T>(selector: (state: FeedbackState) => T): T {
  return useStores().feedback(selector);
}

export function useConfirmation<T>(
  selector: (state: ConfirmationState) => T,
): T {
  return useStores().confirmation(selector);
}

/**
 * Portao de confirmacao: a API que as acoes destrutivas consomem para se
 * proteger. Le o sinalizador de confirmacoes extras das preferencias e aplica a
 * regra pura shouldConfirm. Com ela ligada, delega a store e abre o dialogo;
 * desligada, resolve true na hora, sem dialogo. O padrao de uso e
 * `if (await confirm({...})) doIt()`.
 */
export function useConfirm(): (
  request: ConfirmationRequest,
) => Promise<boolean> {
  const extraConfirmations = usePreferences(
    (state) => state.extraConfirmations,
  );
  const request = useConfirmation((state) => state.request);
  return useCallback(
    (req: ConfirmationRequest): Promise<boolean> => {
      if (!shouldConfirm(extraConfirmations)) {
        return Promise.resolve(true);
      }
      return request(req);
    },
    [extraConfirmations, request],
  );
}
