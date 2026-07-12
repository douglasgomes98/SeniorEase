import type { ZodType } from "zod";
import type { StoragePort } from "../ports/storage-port";

/**
 * Armazenamento validado para uma colecao de registros sob uma chave. A leitura
 * valida cada item com o schema injetado e descarta os invalidos sem quebrar,
 * mantendo os validos - assim um registro corrompido nunca derruba a lista.
 */
export interface NamespacedRecordStore<T> {
  /** Le a colecao; valida cada item e ignora silenciosamente os invalidos. */
  readAll(): Promise<T[]>;
  /** Grava a colecao inteira; rejeita quando a gravacao falha. */
  writeAll(records: T[]): Promise<void>;
  /** Remove a colecao. */
  clear(): Promise<void>;
}

export interface NamespacedRecordStoreOptions<T> {
  key: string;
  schema: ZodType<T>;
}

export function createNamespacedRecordStore<T>(
  storage: StoragePort,
  options: NamespacedRecordStoreOptions<T>,
): NamespacedRecordStore<T> {
  const { key, schema } = options;

  return {
    async readAll(): Promise<T[]> {
      let raw: string | null;
      try {
        raw = await storage.getItem(key);
      } catch {
        return [];
      }
      if (!raw) {
        return [];
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return [];
      }
      if (!Array.isArray(parsed)) {
        return [];
      }

      const records: T[] = [];
      for (const item of parsed) {
        const result = schema.safeParse(item);
        if (result.success) {
          records.push(result.data);
        }
      }
      return records;
    },
    async writeAll(records: T[]): Promise<void> {
      await storage.setItem(key, JSON.stringify(records));
    },
    async clear(): Promise<void> {
      await storage.removeItem(key);
    },
  };
}
