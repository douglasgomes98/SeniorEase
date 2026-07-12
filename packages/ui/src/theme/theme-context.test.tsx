import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Text as RNText } from "react-native";
import { ThemeProvider, useTheme } from "./theme-context";

/** Sonda que projeta valores resolvidos do tema como texto verificavel. */
function Probe() {
  const theme = useTheme();
  return (
    <RNText testID="probe">
      {`${theme.contrast}|body=${theme.font.body}|lg=${theme.space.lg}|bg=${theme.colors.bg}`}
    </RNText>
  );
}

function content(): string {
  return screen.getByTestId("probe").textContent ?? "";
}

describe("ThemeProvider / useTheme", () => {
  // test_theme_provider_rerenders_on_spacing_change
  it("re-resolves space tokens when spacingScale changes", () => {
    const { rerender } = render(
      <ThemeProvider contrast="standard" fontScale={1} spacingScale={1}>
        <Probe />
      </ThemeProvider>,
    );
    expect(content()).toContain("lg=16");

    rerender(
      <ThemeProvider contrast="standard" fontScale={1} spacingScale={1.5}>
        <Probe />
      </ThemeProvider>,
    );
    expect(content()).toContain("lg=24"); // 16 * 1.5
  });

  it("re-resolves font tokens when fontScale changes", () => {
    const { rerender } = render(
      <ThemeProvider contrast="standard" fontScale={1} spacingScale={1}>
        <Probe />
      </ThemeProvider>,
    );
    expect(content()).toContain("body=20");

    rerender(
      <ThemeProvider contrast="standard" fontScale={2} spacingScale={1}>
        <Probe />
      </ThemeProvider>,
    );
    expect(content()).toContain("body=40"); // 20 * 2
  });

  it("re-resolves the palette when contrast changes (high -> maximum)", () => {
    const { rerender } = render(
      <ThemeProvider contrast="standard" fontScale={1} spacingScale={1}>
        <Probe />
      </ThemeProvider>,
    );
    expect(content()).toContain("bg=#EEF2F8");

    rerender(
      <ThemeProvider contrast="high" fontScale={1} spacingScale={1}>
        <Probe />
      </ThemeProvider>,
    );
    expect(content()).toContain("bg=#FFFFFF");
  });

  it("throws when used outside a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
    spy.mockRestore();
  });
});
