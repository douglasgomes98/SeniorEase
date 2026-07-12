import { describe, it, expect } from "vitest";
import {
  ACTIVITIES_MAX,
  ACTIVITY_DESCRIPTION_MAX_LENGTH,
  ACTIVITY_STEP_MAX_LENGTH,
  ACTIVITY_STEPS_MAX,
  ACTIVITY_TITLE_MAX_LENGTH,
  clampActivityDescription,
  clampActivityTitle,
  isActivityStatus,
  normalizeActivitySteps,
  normalizeActivityStatus,
} from "./activity";

describe("activity", () => {
  it("exposes the persisted-collection limits", () => {
    expect(ACTIVITY_TITLE_MAX_LENGTH).toBe(80);
    expect(ACTIVITY_DESCRIPTION_MAX_LENGTH).toBe(280);
    expect(ACTIVITY_STEP_MAX_LENGTH).toBe(120);
    expect(ACTIVITY_STEPS_MAX).toBe(20);
    expect(ACTIVITIES_MAX).toBe(100);
  });

  // test_activity_clamps_lengths
  it("clamps over-long title, description and steps", () => {
    expect(clampActivityTitle("a".repeat(200))).toHaveLength(80);
    expect(clampActivityDescription("b".repeat(500))).toHaveLength(280);

    const steps = normalizeActivitySteps(
      Array.from({ length: 25 }, () => "c".repeat(300)),
    );
    expect(steps).toHaveLength(20);
    expect(steps.every((step) => step.length === 120)).toBe(true);
  });

  it("keeps only string steps and drops the rest", () => {
    expect(
      normalizeActivitySteps(["ok", 5, null, { a: 1 }, "also"]),
    ).toEqual(["ok", "also"]);
    expect(normalizeActivitySteps("not an array")).toEqual([]);
    expect(normalizeActivitySteps(undefined)).toEqual([]);
  });

  it("validates the status set", () => {
    expect(isActivityStatus("pending")).toBe(true);
    expect(isActivityStatus("completed")).toBe(true);
    expect(isActivityStatus("done")).toBe(false);
    expect(isActivityStatus(1)).toBe(false);
  });

  it("coerces status field-by-field: only 'completed' stays completed", () => {
    expect(normalizeActivityStatus("completed")).toBe("completed");
    expect(normalizeActivityStatus("pending")).toBe("pending");
    expect(normalizeActivityStatus("whatever")).toBe("pending");
    expect(normalizeActivityStatus(42)).toBe("pending");
  });
});
