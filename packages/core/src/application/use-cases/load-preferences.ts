import { DEFAULT_PREFERENCES, type Preferences } from "../../domain/preferences";
import type { PreferencesStoragePort } from "../ports/preferences-storage-port";

/**
 * Caso de uso: carregar as preferencias persistidas.
 * Independente de UI e de plataforma. Cai para os padroes quando nao ha dado.
 */
export class LoadPreferences {
  constructor(private readonly storage: PreferencesStoragePort) {}

  async execute(): Promise<Preferences> {
    const stored = await this.storage.load();
    return stored ?? DEFAULT_PREFERENCES;
  }
}
