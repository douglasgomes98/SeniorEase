import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { type ReactElement } from "react";
import { ThemeProvider } from "../theme/theme-context";
import { Text } from "./Text";

function renderThemed(ui: ReactElement, fontScale = 1) {
  return render(
    <ThemeProvider contrast="standard" fontScale={fontScale} spacingScale={1}>
      {ui}
    </ThemeProvider>,
  );
}

/**
 * Nota: jsdom omite as longhands de fonte em getComputedStyle, entao lemos o
 * estilo inline (que o react-native-web sempre emite) diretamente.
 */
function styleOf(el: HTMLElement): CSSStyleDeclaration {
  return el.style;
}

describe("Text", () => {
  // test_text_applies_scale_and_label_variant
  it("applies the font scale to the new 'label' variant with line-height 1.5", () => {
    renderThemed(<Text variant="label">Rotulo</Text>, 2);
    const style = styleOf(screen.getByText("Rotulo"));
    expect(style.fontSize).toBe("44px"); // 22 * 2
    expect(style.lineHeight).toBe("66px"); // 44 * 1.5
  });

  it("uses the Atkinson typeface for every variant", () => {
    renderThemed(<Text>corpo</Text>);
    expect(styleOf(screen.getByText("corpo")).fontFamily).toBe(
      "Atkinson Hyperlegible",
    );
  });

  it("scales the body size with the font scale", () => {
    renderThemed(<Text variant="body">corpo</Text>, 1);
    expect(styleOf(screen.getByText("corpo")).fontSize).toBe("20px");
  });

  it("uses the soft ink color when muted", () => {
    renderThemed(<Text muted>discreto</Text>);
    expect(styleOf(screen.getByText("discreto")).color).toBe(
      "rgb(67, 83, 110)", // inkSoft #43536E
    );
  });

  it("gives the label variant a medium weight by default", () => {
    renderThemed(<Text variant="label">rotulo</Text>);
    expect(styleOf(screen.getByText("rotulo")).fontWeight).toBe("600");
  });
});
