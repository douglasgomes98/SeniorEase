import { describe, expect, it } from "vitest";
import { createFeedbackStore } from "./feedback-store";

describe("createFeedbackStore", () => {
  it("announce define a mensagem atual com tom success por padrao", () => {
    const store = createFeedbackStore();
    store.getState().announce("Pronto");
    const { current } = store.getState();
    expect(current?.text).toBe("Pronto");
    expect(current?.tone).toBe("success");
    expect(typeof current?.id).toBe("number");
  });

  it("announce respeita o tom informado", () => {
    const store = createFeedbackStore();
    store.getState().announce("Aviso", "info");
    expect(store.getState().current?.tone).toBe("info");
  });

  it("announce substitui a atual e gera um novo id (mais recente vence)", () => {
    const store = createFeedbackStore();
    store.getState().announce("Primeira");
    const first = store.getState().current;
    store.getState().announce("Segunda");
    const second = store.getState().current;
    expect(second?.text).toBe("Segunda");
    expect(second?.id).not.toBe(first?.id);
  });

  it("dismiss limpa a mensagem atual", () => {
    const store = createFeedbackStore();
    store.getState().announce("Pronto");
    store.getState().dismiss();
    expect(store.getState().current).toBeNull();
  });

  it("dismiss com id antigo e no-op; com o id atual, limpa", () => {
    const store = createFeedbackStore();
    store.getState().announce("Primeira");
    const staleId = store.getState().current?.id ?? -1;
    store.getState().announce("Segunda");
    store.getState().dismiss(staleId);
    expect(store.getState().current?.text).toBe("Segunda");
    const currentId = store.getState().current?.id ?? -1;
    store.getState().dismiss(currentId);
    expect(store.getState().current).toBeNull();
  });
});
