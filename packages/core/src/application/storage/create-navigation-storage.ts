import type { AppRoute } from "../../domain/app-route";
import type { StoragePort } from "../ports/storage-port";
import { parseNavigation, toPersistedNavigation } from "../navigation-schema";

/**
 * Chave do ultimo modulo visitado. Separada do registro de preferencias -
 * navegacao nao e uma "preferencia" do usuario e a versao vive no proprio
 * conteudo, entao a chave nao muda.
 */
export const NAVIGATION_STORAGE_KEY = "senior-ease/navigation/v1";

/**
 * Fachada tipada do armazenamento do ultimo modulo, sobre a porta generica.
 * Leitura e a prova de falhas (cai para null); gravacao propaga a falha para
 * quem chama decidir - a retomada e uma conveniencia, nao critica.
 */
export interface NavigationStorage {
  load(): Promise<AppRoute | null>;
  save(route: AppRoute): Promise<void>;
}

export function createNavigationStorage(
  storage: StoragePort,
  key: string = NAVIGATION_STORAGE_KEY,
): NavigationStorage {
  return {
    async load(): Promise<AppRoute | null> {
      try {
        const raw = await storage.getItem(key);
        if (!raw) {
          return null;
        }
        const parsed: unknown = JSON.parse(raw);
        return parseNavigation(parsed);
      } catch {
        // Storage indisponivel ou JSON corrompido: sem retomada.
        return null;
      }
    },
    async save(route: AppRoute): Promise<void> {
      const serialized = JSON.stringify(toPersistedNavigation(route));
      await storage.setItem(key, serialized);
    },
  };
}
