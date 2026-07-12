import type { Preferences } from "../../domain/preferences";
import type { PreferencesStoragePort } from "../ports/preferences-storage-port";
import type { EnvelopeStorage } from "./create-envelope-storage";

/**
 * Fachada tipada de preferencias sobre o repositorio de envelope. A serializacao
 * e a validacao ja acontecem no envelope; aqui so adaptamos a fatia de
 * configuracoes ao contrato PreferencesStoragePort. A chave de armazenamento
 * pertence ao repositorio de envelope, nao a esta fachada.
 */
export function createPreferencesStorage(
  envelope: EnvelopeStorage,
): PreferencesStoragePort {
  return {
    load(): Promise<Preferences | null> {
      return envelope.loadSettings();
    },
    save(preferences: Preferences): Promise<void> {
      return envelope.saveSettings(preferences);
    },
  };
}
