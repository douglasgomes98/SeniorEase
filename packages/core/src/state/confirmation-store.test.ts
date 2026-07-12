import { describe, expect, it } from "vitest";
import { createConfirmationStore } from "./confirmation-store";
import type { ConfirmationRequest } from "../domain/confirmation";

function makeRequest(title = "Restaurar padroes"): ConfirmationRequest {
  return {
    title,
    message: "Isto vai restaurar a aparencia para os padroes.",
    confirmLabel: "Restaurar",
    cancelLabel: "Cancelar",
    tone: "danger",
  };
}

describe("createConfirmationStore", () => {
  it("request define current e permanece pendente ate confirm/cancel", async () => {
    const store = createConfirmationStore();
    const req = makeRequest();
    const pending = store.getState().request(req);
    const { current } = store.getState();
    expect(current?.request).toEqual(req);
    expect(typeof current?.id).toBe("number");

    const outcome = await Promise.race([
      pending.then(() => "settled" as const),
      Promise.resolve("pending" as const),
    ]);
    expect(outcome).toBe("pending");
  });

  it("confirm resolve a requisicao como true e limpa", async () => {
    const store = createConfirmationStore();
    const pending = store.getState().request(makeRequest());
    store.getState().confirm();
    await expect(pending).resolves.toBe(true);
    expect(store.getState().current).toBeNull();
  });

  it("cancel resolve a requisicao como false e limpa", async () => {
    const store = createConfirmationStore();
    const pending = store.getState().request(makeRequest());
    store.getState().cancel();
    await expect(pending).resolves.toBe(false);
    expect(store.getState().current).toBeNull();
  });

  it("uma nova requisicao supera a pendente (anterior -> false, mais recente vence)", async () => {
    const store = createConfirmationStore();
    const first = store.getState().request(makeRequest("Primeira"));
    const firstId = store.getState().current?.id;

    const second = store.getState().request(makeRequest("Segunda"));
    await expect(first).resolves.toBe(false);

    const { current } = store.getState();
    expect(current?.request.title).toBe("Segunda");
    expect(current?.id).not.toBe(firstId);

    store.getState().confirm();
    await expect(second).resolves.toBe(true);
  });

  it("confirm/cancel sem requisicao pendente e no-op", () => {
    const store = createConfirmationStore();
    expect(() => store.getState().confirm()).not.toThrow();
    expect(() => store.getState().cancel()).not.toThrow();
    expect(store.getState().current).toBeNull();
  });
});
