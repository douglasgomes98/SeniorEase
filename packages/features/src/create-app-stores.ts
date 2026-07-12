import {
  createPreferencesStorage,
  createPreferencesStore,
  createTourStore,
  LoadPreferences,
  SavePreferences,
  type AppStores,
  type StoragePort,
} from "@senior-ease/core";
import { HOME_TOUR_STEPS } from "./home/tour-config";

/**
 * Composition root de dominio (independente de plataforma): monta os casos de
 * uso e as stores. A unica variacao por plataforma e o adaptador de
 * armazenamento bruto, injetado aqui. Sobre ele, o armazenamento tipado de
 * preferencias (com validacao e migracao) e montado no core - honrando a
 * Inversao de Dependencia.
 */
export function createAppStores(storage: StoragePort): AppStores {
  const preferencesStorage = createPreferencesStorage(storage);
  const loadPreferences = new LoadPreferences(preferencesStorage);
  const savePreferences = new SavePreferences(preferencesStorage);

  const preferences = createPreferencesStore({
    loadPreferences,
    savePreferences,
  });

  const tour = createTourStore({
    steps: HOME_TOUR_STEPS,
    onFinish: () => preferences.getState().setTourCompleted(true),
  });

  return { preferences, tour };
}
