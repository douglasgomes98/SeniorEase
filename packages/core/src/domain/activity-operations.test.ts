import { describe, it, expect } from "vitest";
import {
  ACTIVITIES_MAX,
  ACTIVITY_DESCRIPTION_MAX_LENGTH,
  ACTIVITY_STEPS_MAX,
  ACTIVITY_STEP_MAX_LENGTH,
  ACTIVITY_TITLE_MAX_LENGTH,
  type Activity,
} from "./activity";
import {
  addActivity,
  clearCompletedActivities,
  completeActivity,
  createActivity,
  deleteActivity,
  HISTORY_MAX,
  isBlankTitle,
  listHistory,
  sortActivities,
  type ActivityDraft,
} from "./activity-operations";

function draft(overrides: Partial<ActivityDraft> = {}): ActivityDraft {
  return { title: "Tarefa", description: "", steps: [], due: "", ...overrides };
}

function pending(id: string, overrides: Partial<Activity> = {}): Activity {
  return {
    id,
    title: id,
    description: "",
    steps: [],
    due: "",
    status: "pending",
    createdAt: 0,
    completedAt: null,
    ...overrides,
  };
}

function completed(id: string, completedAt: number): Activity {
  return { ...pending(id), status: "completed", completedAt };
}

describe("activity-operations", () => {
  it("clamps and normalizes on create, with pending defaults", () => {
    const created = createActivity(
      draft({
        title: "a".repeat(200),
        description: "b".repeat(500),
        steps: Array.from({ length: 25 }, () => "c".repeat(300)),
        due: "2026-07-14T09:00",
      }),
      "id-1",
      1234,
    );

    expect(created.id).toBe("id-1");
    expect(created.title).toHaveLength(ACTIVITY_TITLE_MAX_LENGTH);
    expect(created.description).toHaveLength(ACTIVITY_DESCRIPTION_MAX_LENGTH);
    expect(created.steps).toHaveLength(ACTIVITY_STEPS_MAX);
    expect(created.steps.every((step) => step.length === ACTIVITY_STEP_MAX_LENGTH)).toBe(true);
    expect(created.due).toBe("2026-07-14T09:00");
    expect(created.status).toBe("pending");
    expect(created.createdAt).toBe(1234);
    expect(created.completedAt).toBeNull();
  });

  it("keeps empty optionals as empty", () => {
    const created = createActivity(draft(), "id-2", 10);
    expect(created.description).toBe("");
    expect(created.steps).toEqual([]);
    expect(created.due).toBe("");
  });

  it("records the completion time and is idempotent", () => {
    const done = completeActivity(pending("x"), 500);
    expect(done.status).toBe("completed");
    expect(done.completedAt).toBe(500);

    const again = completeActivity(done, 900);
    expect(again.completedAt).toBe(500);
    expect(again).toBe(done);
  });

  it("removes by id, keeping the others and their order", () => {
    const list = [pending("a"), pending("b"), pending("c")];
    const next = deleteActivity(list, "b");
    expect(next.map((activity) => activity.id)).toEqual(["a", "c"]);
    expect(list).toHaveLength(3);
  });

  it("respects the collection cap when adding", () => {
    const full = Array.from({ length: ACTIVITIES_MAX }, (_, index) => pending(`n${index}`));
    const next = addActivity(full, pending("over"));
    expect(next).toBe(full);
    expect(next).toHaveLength(ACTIVITIES_MAX);

    const room = full.slice(0, ACTIVITIES_MAX - 1);
    expect(addActivity(room, pending("ok"))).toHaveLength(ACTIVITIES_MAX);
  });

  it("sorts pending-first, nearest due on top, then completed newest-first", () => {
    const list: Activity[] = [
      pending("noDueOld", { createdAt: 1 }),
      pending("dueLate", { due: "2026-07-20T09:00" }),
      { ...pending("doneOld"), status: "completed", completedAt: 100 },
      pending("dueSoon", { due: "2026-07-14T09:00" }),
      { ...pending("doneNew"), status: "completed", completedAt: 300 },
      pending("noDueNew", { createdAt: 2 }),
    ];

    const sorted = sortActivities(list).map((activity) => activity.id);
    expect(sorted).toEqual([
      "dueSoon",
      "dueLate",
      "noDueOld",
      "noDueNew",
      "doneNew",
      "doneOld",
    ]);
  });

  it("does not mutate the input list when sorting", () => {
    const list = [pending("b", { due: "2026-07-20T09:00" }), pending("a", { due: "2026-07-14T09:00" })];
    const snapshot = list.map((activity) => activity.id);
    sortActivities(list);
    expect(list.map((activity) => activity.id)).toEqual(snapshot);
  });

  it("detects a blank title", () => {
    expect(isBlankTitle("")).toBe(true);
    expect(isBlankTitle("   ")).toBe(true);
    expect(isBlankTitle("ok")).toBe(false);
  });

  it("lists history completed-only, newest first", () => {
    const list: Activity[] = [
      pending("stillPending"),
      completed("doneOld", 100),
      completed("doneNew", 300),
      completed("doneMid", 200),
    ];

    const history = listHistory(list).map((activity) => activity.id);
    expect(history).toEqual(["doneNew", "doneMid", "doneOld"]);
  });

  it("does not mutate the input list when listing history", () => {
    const list: Activity[] = [completed("a", 100), completed("b", 300)];
    const snapshot = list.map((activity) => activity.id);
    listHistory(list);
    expect(list.map((activity) => activity.id)).toEqual(snapshot);
  });

  it("caps history at the 200 most recent", () => {
    const list = Array.from({ length: HISTORY_MAX + 50 }, (_, index) =>
      completed(`c${index}`, index),
    );

    const ids = listHistory(list).map((activity) => activity.id);
    expect(ids).toHaveLength(HISTORY_MAX);
    // Ordenados por conclusao decrescente: o mais recente e o de maior indice.
    expect(ids[0]).toBe(`c${HISTORY_MAX + 49}`);
    expect(ids[ids.length - 1]).toBe("c50");
  });

  it("returns an empty history when nothing is completed", () => {
    expect(listHistory([pending("a"), pending("b")])).toEqual([]);
  });

  it("clears completed, keeping pending in their order", () => {
    const list: Activity[] = [
      pending("p1"),
      completed("d1", 100),
      pending("p2"),
      completed("d2", 200),
    ];

    const cleared = clearCompletedActivities(list);
    expect(cleared.map((activity) => activity.id)).toEqual(["p1", "p2"]);
  });

  it("clear is a no-op when nothing is completed", () => {
    const list = [pending("p1"), pending("p2")];
    expect(clearCompletedActivities(list).map((a) => a.id)).toEqual(["p1", "p2"]);
  });
});
