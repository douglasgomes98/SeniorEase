import type { Preferences } from "../../domain/preferences";

/**
 * Fachada tipada de armazenamento de preferencias (Inversao de Dependencia -
 * D do SOLID). A camada de aplicacao depende desta abstracao, nunca de
 * localStorage ou AsyncStorage. A implementacao vive no core
 * (createPreferencesStorage), construida sobre a porta generica StoragePort, e
 * concentra a serializacao JSON, a validacao e a migracao num unico lugar.
 */
export interface PreferencesStoragePort {
  /** Le e valida; retorna null quando ausente ou invalido. */
  load(): Promise<Preferences | null>;
  /** Persiste; rejeita quando a gravacao falha, para a store observar. */
  save(preferences: Preferences): Promise<void>;
}
