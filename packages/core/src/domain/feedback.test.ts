import { describe, expect, it } from "vitest";
import {
  feedbackDurationMs,
  REINFORCED_FEEDBACK_MS,
  STANDARD_FEEDBACK_MS,
} from "./feedback";

describe("feedbackDurationMs", () => {
  it("usa a duracao padrao (3 s) sem feedback reforcado", () => {
    expect(feedbackDurationMs(false)).toBe(STANDARD_FEEDBACK_MS);
    expect(feedbackDurationMs(false)).toBe(3000);
  });

  it("usa a duracao reforcada (5 s) com feedback reforcado", () => {
    expect(feedbackDurationMs(true)).toBe(REINFORCED_FEEDBACK_MS);
    expect(feedbackDurationMs(true)).toBe(5000);
  });
});
