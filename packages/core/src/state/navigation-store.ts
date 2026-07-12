import { create, type StoreApi, type UseBoundStore } from "zustand";
import { APP_ROUTE_DEFAULT, type AppRoute } from "../domain/app-route";
import type { NavigationStorage } from "../application/storage/create-navigation-storage";

export interface NavigationState {
  /** Pilha de rotas; nunca vazia, com "home" na base. */
  stack: AppRoute[];
  /** Derivado: topo da pilha. */
  current: AppRoute;
  /** Derivado: ha uma rota anterior para voltar. */
  canGoBack: boolean;
  /** Ultimo modulo (nao "home") visitado - alvo da retomada. */
  lastModule: AppRoute | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  navigate: (route: AppRoute) => void;
  back: () => void;
  resetToHome: () => void;
  resume: () => void;
}

export interface NavigationStoreDeps {
  navigationStorage: NavigationStorage;
}

export type NavigationStore = UseBoundStore<StoreApi<NavigationState>>;

/** Recalcula o estado derivado a partir da pilha (fonte unica da verdade). */
function fromStack(stack: AppRoute[]): Pick<
  NavigationState,
  "stack" | "current" | "canGoBack"
> {
  return {
    stack,
    current: stack[stack.length - 1] ?? APP_ROUTE_DEFAULT,
    canGoBack: stack.length > 1,
  };
}

/**
 * Fabrica da store de navegacao (pilha de rotas em memoria, identica em Web e
 * Mobile). Ao entrar num modulo, persiste o ultimo modulo por injecao para
 * oferecer retomada no proximo lancamento - nunca navega automaticamente.
 */
export function createNavigationStore(
  deps: NavigationStoreDeps,
): NavigationStore {
  return create<NavigationState>((set, get) => ({
    ...fromStack([APP_ROUTE_DEFAULT]),
    lastModule: null,
    isHydrated: false,
    hydrate: async (): Promise<void> => {
      const lastModule = await deps.navigationStorage.load();
      set({ lastModule, isHydrated: true });
    },
    navigate: (route: AppRoute): void => {
      set(fromStack([...get().stack, route]));
      if (route !== APP_ROUTE_DEFAULT) {
        set({ lastModule: route });
        void deps.navigationStorage.save(route).catch(() => {
          // Best-effort: a retomada e uma conveniencia, nao critica.
        });
      }
    },
    back: (): void => {
      const { stack } = get();
      if (stack.length > 1) {
        set(fromStack(stack.slice(0, -1)));
      }
    },
    resetToHome: (): void => {
      set(fromStack([APP_ROUTE_DEFAULT]));
    },
    resume: (): void => {
      const { lastModule } = get();
      if (lastModule) {
        get().navigate(lastModule);
      }
    },
  }));
}
