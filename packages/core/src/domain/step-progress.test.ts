import { describe, it, expect } from "vitest";
import {
  startStepProgress,
  advanceStep,
  regressStep,
  isAtFirstStep,
  isAtLastStep,
  hasSteps,
} from "./step-progress";

describe("step-progress", () => {
  it("starts at the first step with the given total", () => {
    const progress = startStepProgress(4);
    expect(progress.currentIndex).toBe(0);
    expect(progress.totalSteps).toBe(4);
  });

  it("advances forward one step", () => {
    const progress = advanceStep(startStepProgress(4));
    expect(progress.currentIndex).toBe(1);
  });

  it("clamps advance at the last step", () => {
    // no ultimo indice, avancar nao ultrapassa totalSteps - 1
    const atLast = { currentIndex: 3, totalSteps: 4 };
    expect(advanceStep(atLast).currentIndex).toBe(3);
  });

  it("regresses back one step", () => {
    const progress = regressStep({ currentIndex: 2, totalSteps: 4 });
    expect(progress.currentIndex).toBe(1);
  });

  it("clamps regress at the first step", () => {
    // no primeiro indice, voltar nao passa de 0
    expect(regressStep(startStepProgress(4)).currentIndex).toBe(0);
  });

  it("detects the first and last steps at the bounds and not in the middle", () => {
    const total = 4;
    expect(isAtFirstStep({ currentIndex: 0, totalSteps: total })).toBe(true);
    expect(isAtLastStep({ currentIndex: 0, totalSteps: total })).toBe(false);

    expect(isAtFirstStep({ currentIndex: 2, totalSteps: total })).toBe(false);
    expect(isAtLastStep({ currentIndex: 2, totalSteps: total })).toBe(false);

    expect(isAtFirstStep({ currentIndex: 3, totalSteps: total })).toBe(false);
    expect(isAtLastStep({ currentIndex: 3, totalSteps: total })).toBe(true);
  });

  it("reports whether the activity has any steps", () => {
    expect(hasSteps(startStepProgress(0))).toBe(false);
    expect(hasSteps(startStepProgress(3))).toBe(true);
  });
});
