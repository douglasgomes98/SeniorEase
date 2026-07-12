import { DEFAULT_PREFERENCES, type Preferences } from "../../domain/preferences";
import type { Activity } from "../../domain/activity";
import type { StoragePort } from "../ports/storage-port";
import {
  parseEnvelope,
  toEnvelope,
  type EnvelopeSlices,
} from "../persistence-envelope-schema";

/**
 * Chave unica do envelope de persistencia. Configuracoes e atividades vivem
 * juntas neste registro; a chave de navegacao fica fora, de proposito.
 */
export const PERSISTENCE_STORAGE_KEY = "seniorease.v1";

/**
 * Repositorio de envelope sobre a porta generica de armazenamento. Concentra a
 * serializacao JSON e a validacao versionada num unico lugar. Cada gravacao faz
 * leitura-modificacao-escrita: salvar uma fatia preserva a outra sob a mesma
 * chave, entao as duas stores persistem de forma independente sem se
 * sobrescrever. A leitura e a prova de falhas (cai para padroes); a gravacao
 * propaga a falha para a store observar.
 */
export interface EnvelopeStorage {
  loadSettings(): Promise<Preferences | null>;
  saveSettings(settings: Preferences): Promise<void>;
  loadActivities(): Promise<Activity[]>;
  saveActivities(activities: Activity[]): Promise<void>;
}

export function createEnvelopeStorage(storage: StoragePort): EnvelopeStorage {
  async function readSlices(): Promise<EnvelopeSlices> {
    try {
      const raw = await storage.getItem(PERSISTENCE_STORAGE_KEY);
      if (!raw) {
        return { settings: null, activities: [] };
      }
      const parsed: unknown = JSON.parse(raw);
      return parseEnvelope(parsed);
    } catch {
      // Storage indisponivel ou JSON corrompido: cai para padroes.
      return { settings: null, activities: [] };
    }
  }

  async function writeEnvelope(
    settings: Preferences,
    activities: Activity[],
  ): Promise<void> {
    const serialized = JSON.stringify(toEnvelope(settings, activities));
    await storage.setItem(PERSISTENCE_STORAGE_KEY, serialized);
  }

  return {
    async loadSettings(): Promise<Preferences | null> {
      return (await readSlices()).settings;
    },
    async loadActivities(): Promise<Activity[]> {
      return (await readSlices()).activities;
    },
    async saveSettings(settings: Preferences): Promise<void> {
      const current = await readSlices();
      await writeEnvelope(settings, current.activities);
    },
    async saveActivities(activities: Activity[]): Promise<void> {
      const current = await readSlices();
      await writeEnvelope(current.settings ?? DEFAULT_PREFERENCES, activities);
    },
  };
}
