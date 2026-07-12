import { describe, it, expect } from "vitest";
import { z } from "zod";
import type { StoragePort } from "../ports/storage-port";
import { createNamespacedRecordStore } from "./namespaced-record-store";

const recordSchema = z.object({ id: z.string(), title: z.string() });
type StoredRecord = z.infer<typeof recordSchema>;

const KEY = "senior-ease/records/v1";

function inMemoryStorage(initial: Record<string, string> = {}): StoragePort {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key) => Promise.resolve(map.get(key) ?? null),
    setItem: (key, value) => {
      map.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key) => {
      map.delete(key);
      return Promise.resolve();
    },
  };
}

function makeStore(port: StoragePort) {
  return createNamespacedRecordStore<StoredRecord>(port, {
    key: KEY,
    schema: recordSchema,
  });
}

describe("createNamespacedRecordStore", () => {
  it("returns an empty list when nothing is stored", async () => {
    expect(await makeStore(inMemoryStorage()).readAll()).toEqual([]);
  });

  it("round-trips a valid collection", async () => {
    const port = inMemoryStorage();
    const store = makeStore(port);
    const records: StoredRecord[] = [
      { id: "a", title: "Consulta" },
      { id: "b", title: "Caminhada" },
    ];
    await store.writeAll(records);
    expect(await store.readAll()).toEqual(records);
  });

  // test_record_store_skips_invalid_items
  it("skips invalid items and keeps the valid ones", async () => {
    const stored = JSON.stringify([
      { id: "a", title: "Consulta" },
      { id: 42, title: "invalido" },
      { title: "sem id" },
      { id: "b", title: "Caminhada" },
    ]);
    const store = makeStore(inMemoryStorage({ [KEY]: stored }));
    expect(await store.readAll()).toEqual([
      { id: "a", title: "Consulta" },
      { id: "b", title: "Caminhada" },
    ]);
  });

  it("never throws on corrupt or non-array data", async () => {
    const corrupt = makeStore(inMemoryStorage({ [KEY]: "{ not json" }));
    expect(await corrupt.readAll()).toEqual([]);

    const notArray = makeStore(
      inMemoryStorage({ [KEY]: JSON.stringify({ id: "a", title: "x" }) }),
    );
    expect(await notArray.readAll()).toEqual([]);
  });

  it("returns an empty list when the raw read throws", async () => {
    const failingRead: StoragePort = {
      getItem: () => Promise.reject(new Error("unavailable")),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
    expect(await makeStore(failingRead).readAll()).toEqual([]);
  });

  it("propagates a write failure", async () => {
    const failing: StoragePort = {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.reject(new Error("quota exceeded")),
      removeItem: () => Promise.resolve(),
    };
    await expect(makeStore(failing).writeAll([])).rejects.toThrow(
      "quota exceeded",
    );
  });

  it("clears the collection", async () => {
    const port = inMemoryStorage({
      [KEY]: JSON.stringify([{ id: "a", title: "x" }]),
    });
    const store = makeStore(port);
    await store.clear();
    expect(await port.getItem(KEY)).toBeNull();
  });
});
