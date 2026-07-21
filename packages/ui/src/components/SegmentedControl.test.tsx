import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { type ReactElement } from "react";
import * as ReactNative from "react-native";
import { ThemeProvider } from "../theme/theme-context";
import { SegmentedControl } from "./SegmentedControl";

function renderThemed(ui: ReactElement) {
  return render(
    <ThemeProvider contrast="standard" fontScale={1} spacingScale={1}>
      {ui}
    </ThemeProvider>,
  );
}

describe("SegmentedControl", () => {
  it("stacks options at the compact viewport breakpoint", () => {
    vi.spyOn(ReactNative, "useWindowDimensions").mockReturnValue({
      width: 600,
      height: 844,
      scale: 1,
      fontScale: 1,
    });

    renderThemed(
      <SegmentedControl
        accessibilityLabel="Contraste"
        options={[
          { value: "standard", label: "Padrao" },
          { value: "high", label: "Maximo" },
        ]}
        value="standard"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("radiogroup", { name: "Contraste" })).toHaveStyle({
      flexDirection: "column",
    });
  });

  it("exposes the group, options, selection, and 48dp target", () => {
    const onChange = vi.fn();

    renderThemed(
      <SegmentedControl
        accessibilityLabel="Contraste"
        options={[
          { value: "standard", label: "Padrao" },
          { value: "high", label: "Maximo" },
        ]}
        value="standard"
        onChange={onChange}
      />,
    );

    const group = screen.getByRole("radiogroup", { name: "Contraste" });
    expect(group).toBeInTheDocument();
    expect(group).toHaveStyle({ flexWrap: "wrap" });
    expect(screen.getByRole("radio", { name: "Padrao" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Maximo" })).toHaveStyle({
      minHeight: "48px",
    });
  });
});
