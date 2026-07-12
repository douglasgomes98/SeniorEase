import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { type ReactElement } from "react";
import { ThemeProvider } from "../theme/theme-context";
import { Button } from "./Button";

function renderThemed(ui: ReactElement) {
  return render(
    <ThemeProvider contrast="standard" fontScale={1} spacingScale={1}>
      {ui}
    </ThemeProvider>,
  );
}

describe("Button", () => {
  // test_button_control_height_and_touch_target
  it("renders the default control height over the 48dp touch-target floor", () => {
    renderThemed(<Button label="Salvar" onPress={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ minHeight: "52px", minWidth: "48px" });
  });

  it("renders the large control height when size='large'", () => {
    renderThemed(<Button label="Salvar" onPress={() => {}} size="large" />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ minHeight: "60px", minWidth: "48px" });
  });

  it("applies themed colors for the primary variant", () => {
    renderThemed(<Button label="Salvar" onPress={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ backgroundColor: "rgb(27, 87, 176)" }); // accent #1B57B0
  });

  it("is keyboard-focusable (supports the visible focus ring)", () => {
    renderThemed(<Button label="Salvar" onPress={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("tabindex", "0");
  });

  it("exposes an accessible name and fires onPress", () => {
    const onPress = vi.fn();
    renderThemed(
      <Button label="Salvar" onPress={onPress} accessibilityLabel="Salvar tudo" />,
    );
    const button = screen.getByRole("button", { name: "Salvar tudo" });
    button.click();
    expect(onPress).toHaveBeenCalledOnce();
  });
});
