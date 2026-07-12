import type { Activity } from "../../domain/activity";
import type { ActivitiesStoragePort } from "../ports/activities-storage-port";

/**
 * Caso de uso: carregar as atividades persistidas e validadas.
 * Independente de UI e de plataforma. A fachada ja cai para lista vazia quando
 * nao ha dado ou o dado e invalido.
 */
export class LoadActivities {
  constructor(private readonly storage: ActivitiesStoragePort) {}

  execute(): Promise<Activity[]> {
    return this.storage.load();
  }
}
