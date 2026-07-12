import type { Activity } from "../../domain/activity";
import type { ActivitiesStoragePort } from "../ports/activities-storage-port";
import type { EnvelopeStorage } from "./create-envelope-storage";

/**
 * Fachada tipada de atividades sobre o repositorio de envelope. A validacao de
 * fronteira ja acontece no envelope; aqui so adaptamos a fatia de atividades ao
 * contrato ActivitiesStoragePort consumido pela feature de lista.
 */
export function createActivitiesStorage(
  envelope: EnvelopeStorage,
): ActivitiesStoragePort {
  return {
    load(): Promise<Activity[]> {
      return envelope.loadActivities();
    },
    save(activities: Activity[]): Promise<void> {
      return envelope.saveActivities(activities);
    },
  };
}
