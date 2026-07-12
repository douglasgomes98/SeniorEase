import type { Preferences } from "../../domain/preferences";
import type { PreferencesStoragePort } from "../ports/preferences-storage-port";
import type { StoragePort } from "../ports/storage-port";
import { parsePreferences, toPersisted } from "../preferences-schema";

/**
 * Chave estavel do registro de preferencias. O numero de versao no proprio
 * conteudo (schemaVersion) e quem dirige a migracao, entao a chave nao muda -
 * instalacoes existentes sao lidas e atualizadas no lugar.
 */
export const PREFERENCES_STORAGE_KEY = "senior-ease/preferences/v1";

/**
 * Monta o armazenamento tipado de preferencias sobre a porta generica. Aqui a
 * serializacao JSON e a validacao acontecem uma unica vez no core - nenhum
 * adaptador de plataforma precisa repeti-las, e nenhum novo adaptador pode
 * esquecer de validar. Leitura e a prova de falhas (cai para os padroes);
 * gravacao propaga a falha para a store observar.
 */
export function createPreferencesStorage(
  storage: StoragePort,
  key: string = PREFERENCES_STORAGE_KEY,
): PreferencesStoragePort {
  return {
    async load(): Promise<Preferences | null> {
      try {
        const raw = await storage.getItem(key);
        if (!raw) {
          return null;
        }
        const parsed: unknown = JSON.parse(raw);
        return parsePreferences(parsed);
      } catch {
        // Storage indisponivel ou JSON corrompido: cai para os padroes.
        return null;
      }
    },
    async save(preferences: Preferences): Promise<void> {
      const serialized = JSON.stringify(toPersisted(preferences));
      await storage.setItem(key, serialized);
    },
  };
}
