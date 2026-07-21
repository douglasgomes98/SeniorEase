import { render, screen } from "@testing-library/react";
import { type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../theme/theme-context";
import { AppHeader } from "./AppHeader";

function renderThemed(ui: ReactElement) {
  return render(
    <ThemeProvider contrast="standard" fontScale={2} spacingScale={1.5}>
      {ui}
    </ThemeProvider>,
  );
}

describe("AppHeader", () => {
  it("wraps the back action and long title at the maximum text scale", () => {
    renderThemed(
      <AppHeader
        title="Personalizacao"
        showBack
        backLabel="Voltar"
        onBack={vi.fn()}
        testID="app-header"
      />,
    );

    expect(screen.getByTestId("app-header")).toHaveStyle({ flexWrap: "wrap" });
    expect(screen.getByRole("heading", { name: "Personalizacao" })).toHaveStyle({
      minWidth: "0px",
    });
  });
});
