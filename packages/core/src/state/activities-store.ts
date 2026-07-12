import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { Activity } from "../domain/activity";
import type { LoadActivities } from "../application/use-cases/load-activities";
import type { SaveActivities } from "../application/use-cases/save-activities";

export interface ActivitiesState {
  activities: Activity[];
  isHydrated: boolean;
  /** Verdadeiro apos uma gravacao falhar; limpo na proxima gravacao bem-sucedida. */
  persistenceError: boolean;
  hydrate: () => Promise<void>;
  /**
   * Substitui a lista em memoria e persiste. A feature de lista calcula `next`
   * com suas operacoes de dominio (criar, concluir, excluir, reordenar) e chama
   * este metodo - o esqueleto de persistencia fica aqui, num unico lugar.
   */
  replaceActivities: (next: Activity[]) => void;
}

export interface ActivitiesStoreDeps {
  loadActivities: LoadActivities;
  saveActivities: SaveActivities;
}

export type ActivitiesStore = UseBoundStore<StoreApi<ActivitiesState>>;

/**
 * Fabrica da store de atividades. Recebe os casos de uso por injecao
 * (composition root no app). A store e um adaptador de interface: mantem a lista
 * validada em memoria e delega a persistencia aos casos de uso.
 */
export function createActivitiesStore(
  deps: ActivitiesStoreDeps,
): ActivitiesStore {
  return create<ActivitiesState>((set, get) => {
    /**
     * Persiste a lista atual. A mudanca ja esta em memoria; se a gravacao
     * falhar, mantemos o valor e marcamos persistenceError para a UI mostrar um
     * aviso gentil. Uma gravacao bem-sucedida limpa a marca.
     */
    const persist = (): void => {
      void deps.saveActivities
        .execute(get().activities)
        .then(() => {
          if (get().persistenceError) {
            set({ persistenceError: false });
          }
        })
        .catch(() => {
          set({ persistenceError: true });
        });
    };

    return {
      activities: [],
      isHydrated: false,
      persistenceError: false,
      hydrate: async (): Promise<void> => {
        const activities = await deps.loadActivities.execute();
        set({ activities, isHydrated: true });
      },
      replaceActivities: (next: Activity[]): void => {
        set({ activities: next });
        persist();
      },
    };
  });
}
