import { describe, it, expect } from "vitest";
import { nextActivityId } from "./activity-id";

describe("activity-id", () => {
  it("produces unique, non-empty ids on every call", () => {
    const ids = new Set<string>();
    for (let index = 0; index < 1000; index += 1) {
      const id = nextActivityId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
      ids.add(id);
    }
    expect(ids.size).toBe(1000);
  });
});
