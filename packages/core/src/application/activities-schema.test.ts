import { describe, it, expect } from "vitest";
import type { Activity } from "../domain/activity";
import { parseActivities, toPersistedActivities } from "./activities-schema";

const validActivity: Activity = {
  id: "a1",
  title: "Pagar a conta de luz",
  description: "",
  steps: ["Abrir o app do banco", "Pagar o boleto"],
  due: "2026-07-20T09:00:00.000Z",
  status: "pending",
  createdAt: 1752300000000,
  completedAt: null,
};

describe("activities-schema", () => {
  it("parses a well-formed collection unchanged", () => {
    expect(parseActivities([validActivity])).toEqual([validActivity]);
  });

  it("returns an empty list for non-array input", () => {
    expect(parseActivities(null)).toEqual([]);
    expect(parseActivities({})).toEqual([]);
    expect(parseActivities("nope")).toEqual([]);
  });

  it("skips records missing a valid id or title", () => {
    const parsed = parseActivities([
      { title: "no id" },
      { id: "x" },
      { id: 5, title: "id not a string" },
      validActivity,
    ]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.id).toBe("a1");
  });

  it("clamps lengths and coerces fields on kept records", () => {
    const [activity] = parseActivities([
      {
        id: "b1",
        title: "t".repeat(200),
        description: "d".repeat(500),
        steps: [...Array.from({ length: 25 }, () => "s".repeat(300)), 7, null],
        due: 12345,
        status: "weird",
        createdAt: "nan",
        completedAt: "nan",
      },
    ]);
    expect(activity?.title).toHaveLength(80);
    expect(activity?.description).toHaveLength(280);
    expect(activity?.steps).toHaveLength(20);
    expect(activity?.steps.every((s) => s.length === 120)).toBe(true);
    expect(activity?.due).toBe("");
    expect(activity?.status).toBe("pending");
    expect(typeof activity?.createdAt).toBe("number");
    expect(activity?.completedAt).toBeNull();
  });

  it("keeps a completed status and a numeric completedAt", () => {
    const [activity] = parseActivities([
      { id: "c1", title: "done", status: "completed", completedAt: 1752300000001 },
    ]);
    expect(activity?.status).toBe("completed");
    expect(activity?.completedAt).toBe(1752300000001);
  });

  // test_parse_activities_skips_invalid_and_caps
  it("skips an invalid record and caps the list at 100", () => {
    const many = Array.from({ length: 120 }, (_, i) => ({
      id: `id-${i}`,
      title: `Activity ${i}`,
    }));
    const parsed = parseActivities([{ title: "no id" }, ...many]);
    expect(parsed).toHaveLength(100);
    expect(parsed[0]?.id).toBe("id-0");
    expect(parsed[99]?.id).toBe("id-99");
  });

  it("caps the collection on write as well", () => {
    const many = Array.from({ length: 130 }, (_, i) => ({
      ...validActivity,
      id: `id-${i}`,
    }));
    expect(toPersistedActivities(many)).toHaveLength(100);
  });

  it("round-trips through toPersistedActivities and parseActivities", () => {
    const persisted = toPersistedActivities([validActivity]);
    expect(parseActivities(persisted)).toEqual([validActivity]);
  });
});
