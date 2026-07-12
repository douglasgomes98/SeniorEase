import type { Activity } from "../../domain/activity";
import type { ActivitiesStoragePort } from "../ports/activities-storage-port";

/**
 * Caso de uso: persistir as atividades.
 * Independente de UI e de plataforma.
 */
export class SaveActivities {
  constructor(private readonly storage: ActivitiesStoragePort) {}

  execute(activities: Activity[]): Promise<void> {
    return this.storage.save(activities);
  }
}
