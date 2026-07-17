import type { Preferences } from "../../domain/preferences";
import type { PreferencesStoragePort } from "../ports/preferences-storage-port";

/**
 * Caso de uso: persistir as preferencias.
 * Independente de UI e de plataforma.
 */
export class SavePreferences {
  constructor(private readonly storage: PreferencesStoragePort) {}

  execute(preferences: Preferences): Promise<void> {
    return this.storage.save(preferences);
  }
}
