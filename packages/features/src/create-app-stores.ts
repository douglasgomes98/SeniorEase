import {
  createActivitiesStorage,
  createActivitiesStore,
  createEnvelopeStorage,
  createNavigationStorage,
  createNavigationStore,
  createPreferencesStorage,
  createPreferencesStore,
  createTourStore,
  LoadActivities,
  LoadPreferences,
  SaveActivities,
  SavePreferences,
  type AppStores,
  type StoragePort,
} from "@senior-ease/core";
import { HOME_TOUR_STEPS } from "./home/tour-config";

/**
 * Composition root de dominio (independente de plataforma): monta os casos de
 * uso e as stores. A unica variacao por plataforma e o adaptador de
 * armazenamento bruto, injetado aqui. Sobre ele, o repositorio de envelope (com
 * serializacao e validacao versionada) e montado no core, e as fachadas tipadas
 * derivam dele - honrando a Inversao de Dependencia.
 */
export function createAppStores(storage: StoragePort): AppStores {
  const envelope = createEnvelopeStorage(storage);

  const preferencesStorage = createPreferencesStorage(envelope);
  const loadPreferences = new LoadPreferences(preferencesStorage);
  const savePreferences = new SavePreferences(preferencesStorage);

  const preferences = createPreferencesStore({
    loadPreferences,
    savePreferences,
  });

  const activitiesStorage = createActivitiesStorage(envelope);
  const loadActivities = new LoadActivities(activitiesStorage);
  const saveActivities = new SaveActivities(activitiesStorage);

  const activities = createActivitiesStore({
    loadActivities,
    saveActivities,
  });

  const tour = createTourStore({
    steps: HOME_TOUR_STEPS,
    onFinish: () => preferences.getState().setTourCompleted(true),
  });

  const navigationStorage = createNavigationStorage(storage);
  const navigation = createNavigationStore({ navigationStorage });

  return { preferences, tour, navigation, activities };
}
