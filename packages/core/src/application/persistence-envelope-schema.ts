import type { Activity } from "../domain/activity";
import type { Preferences } from "../domain/preferences";
import { parseActivities, toPersistedActivities } from "./activities-schema";
import {
  parseSettings,
  toPersistedSettings,
  type PersistedSettings,
} from "./preferences-schema";

/**
 * Envelope unico de persistencia: configuracoes e atividades guardadas juntas
 * sob uma unica chave, com uma versao no nivel do envelope. A versao permite
 * evoluir o formato com seguranca; versoes ausentes, diferentes ou corrompidas
 * caem para padroes seguros (configuracoes) e lista vazia (atividades), sem
 * quebrar a aplicacao. As fatias sao validadas de forma independente.
 */
export const PERSISTENCE_ENVELOPE_VERSION = 1;

/** Fatias resultantes da leitura do envelope. */
export interface EnvelopeSlices {
  /** Configuracoes coagidas, ou null quando ausentes/invalidas (usar padroes). */
  settings: Preferences | null;
  /** Atividades validadas; lista vazia quando ausentes/invalidas. */
  activities: Activity[];
}

/** Forma persistida do envelope. */
export interface PersistenceEnvelope {
  version: typeof PERSISTENCE_ENVELOPE_VERSION;
  settings: PersistedSettings;
  activities: Activity[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Divide um payload desconhecido nas fatias de configuracoes e atividades. Exige
 * um objeto com version === PERSISTENCE_ENVELOPE_VERSION; qualquer outra coisa
 * (ausente, diferente, nao-objeto) rejeita o envelope inteiro.
 */
export function parseEnvelope(raw: unknown): EnvelopeSlices {
  if (!isPlainObject(raw) || raw.version !== PERSISTENCE_ENVELOPE_VERSION) {
    return { settings: null, activities: [] };
  }
  return {
    settings: parseSettings(raw.settings),
    activities: parseActivities(raw.activities),
  };
}

/** Monta o envelope persistido a partir das configuracoes e atividades atuais. */
export function toEnvelope(
  settings: Preferences,
  activities: Activity[],
): PersistenceEnvelope {
  return {
    version: PERSISTENCE_ENVELOPE_VERSION,
    settings: toPersistedSettings(settings),
    activities: toPersistedActivities(activities),
  };
}
