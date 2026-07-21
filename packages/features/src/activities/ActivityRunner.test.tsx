import {
  createActivity,
  listHistory,
  StoresProvider,
  type NotificationSchedulerPort,
  type StoragePort,
} from "@senior-ease/core";
import { I18nProvider } from "@senior-ease/i18n";
import { ThemeProvider } from "@senior-ease/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createAppStores } from "../create-app-stores";
import { ActivityRunner } from "./ActivityRunner";

const storage: StoragePort = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};

const scheduler: NotificationSchedulerPort = {
  isSupported: () => true,
  getPermission: async () => "granted",
  requestPermission: async () => "granted",
  schedule: async () => undefined,
  cancel: async () => undefined,
  cancelAll: async () => undefined,
};

describe("ActivityRunner", () => {
  it("advances every step and completes the activity only on Finish", () => {
    const stores = createAppStores(storage, scheduler);
    const activity = createActivity(
      {
        title: "Tomar remedio",
        description: "",
        steps: ["Separar agua", "Tomar remedio", "Guardar a caixa"],
        due: "",
      },
      "a1",
      1,
    );
    const onClose = vi.fn();
    stores.activities.getState().replaceActivities([activity]);

    render(
      <StoresProvider stores={stores}>
        <I18nProvider locale="pt">
          <ThemeProvider contrast="standard" fontScale={1} spacingScale={1}>
            <ActivityRunner activity={activity} onClose={onClose} />
          </ThemeProvider>
        </I18nProvider>
      </StoresProvider>,
    );

    expect(screen.getByText("Passo 1 de 3")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Proximo" }));
    expect(screen.getByText("Passo 2 de 3")).not.toBeNull();
    expect(stores.activities.getState().activities[0]?.status).toBe("pending");

    fireEvent.click(screen.getByRole("button", { name: "Proximo" }));
    expect(screen.getByText("Passo 3 de 3")).not.toBeNull();
    expect(stores.activities.getState().activities[0]?.status).toBe("pending");

    fireEvent.click(screen.getByRole("button", { name: "Concluir" }));
    expect(listHistory(stores.activities.getState().activities)).toHaveLength(1);
    expect(stores.feedback.getState().current).toMatchObject({
      text: "Muito bem! Tarefa concluida.",
      tone: "success",
    });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
