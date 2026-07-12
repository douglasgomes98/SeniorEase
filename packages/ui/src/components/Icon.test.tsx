import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { View } from "react-native";
import { ThemeProvider } from "../theme/theme-context";
import { Icon } from "./Icon";
import { Text } from "./Text";

function renderThemed(ui: React.ReactElement) {
  return render(
    <ThemeProvider contrast="standard" fontScale={1} spacingScale={1}>
      {ui}
    </ThemeProvider>,
  );
}

describe("Icon", () => {
  // test_icon_is_decorative_and_label_paired
  it("is decorative (hidden from assistive tech) while the sibling label carries the name", () => {
    renderThemed(
      <View>
        <Icon name="home" testID="hub-icon" />
        <Text>Inicio</Text>
      </View>,
    );

    const icon = screen.getByTestId("hub-icon");
    expect(icon).toHaveAttribute("aria-hidden", "true");

    // O rotulo visivel permanece exposto como a fonte do significado.
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("renders the requested Material Symbols glyph with the icon typeface", () => {
    renderThemed(<Icon name="person" testID="glyph" />);
    const icon = screen.getByTestId("glyph");
    expect(icon).toHaveTextContent("person");
    // jsdom omite as longhands de fonte no computed style; lemos o inline.
    expect(icon.style.fontFamily).toBe("Material Symbols Rounded");
  });

  it("uses the themed ink color and a title-sized glyph by default", () => {
    renderThemed(<Icon name="settings" testID="glyph" />);
    const icon = screen.getByTestId("glyph");
    expect(icon.style.color).toBe("rgb(21, 35, 59)"); // ink #15233B
    expect(icon.style.fontSize).toBe("28px"); // title size at scale 1
  });
});
