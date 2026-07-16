import {
  createActivitiesStorage,
  createActivitiesStore,
  createConfirmationStore,
  createEnvelopeStorage,
  createFeedbackStore,
  createNavigationStorage,
  createNavigationStore,
  createPreferencesStorage,
  createPreferencesStore,
  createReminderStore,
  createTourStore,
  LoadActivities,
  LoadPreferences,
  SaveActivities,
  SavePreferences,
  type AppStores,
  type NotificationSchedulerPort,
  type StoragePort,
} from "@senior-ease/core";
import { HOME_TOUR_STEPS } from "./home/tour-config";

/**
 * Composition root de dominio (independente de plataforma): monta os casos de
 * uso e as stores. As variacoes por plataforma sao os adaptadores injetados
 * aqui: o armazenamento bruto e o agendador de notificacoes. Sobre o storage, o
 * repositorio de envelope (com serializacao e validacao versionada) e montado no
 * core, e as fachadas tipadas derivam dele; sobre o agendador, a store de
 * lembretes reconcilia o agendamento - honrando a Inversao de Dependencia.
 */
export function createAppStores(
  storage: StoragePort,
  notifications: NotificationSchedulerPort,
): AppStores {
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

  const feedback = createFeedbackStore();

  const confirmation = createConfirmationStore();

  const reminders = createReminderStore({ scheduler: notifications });

  return {
    preferences,
    tour,
    navigation,
    activities,
    feedback,
    confirmation,
    reminders,
  };
}
