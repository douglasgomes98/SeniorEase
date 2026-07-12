import { describe, expect, it } from "vitest";
import { shouldConfirm } from "./confirmation";

describe("shouldConfirm", () => {
  it("mostra o dialogo quando as confirmacoes extras estao ligadas", () => {
    expect(shouldConfirm(true)).toBe(true);
  });

  it("segue direto quando as confirmacoes extras estao desligadas", () => {
    expect(shouldConfirm(false)).toBe(false);
  });
});
