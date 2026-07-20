import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { type ReactElement } from "react";
import { ThemeProvider } from "../theme/theme-context";
import { Toggle } from "./Toggle";

function renderThemed(ui: ReactElement) {
  return render(
    <ThemeProvider contrast="standard" fontScale={1} spacingScale={1}>
      {ui}
    </ThemeProvider>,
  );
}

describe("Toggle", () => {
  it("exposes its state, 48dp target, and inverse value on click", () => {
    const onValueChange = vi.fn();

    renderThemed(<Toggle label="Lembretes" value={false} onValueChange={onValueChange} />);

    const toggle = screen.getByRole("switch", { name: "Lembretes" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(toggle).toHaveStyle({ minHeight: "48px" });

    toggle.click();
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});
