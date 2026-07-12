import { View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme/theme-context";
import { type SpaceKey } from "../tokens";

export interface StackProps extends ViewProps {
  direction?: "row" | "column";
  gap?: SpaceKey;
  align?: ViewStyle["alignItems"];
  justify?: ViewStyle["justifyContent"];
}

/**
 * Primitivo de layout com espacamento por token, ciente do tema: o gap honra o
 * multiplicador de espacamento do usuario. Puro, dirigido por props.
 */
export function Stack({
  direction = "column",
  gap = "md",
  align,
  justify,
  style,
  ...rest
}: StackProps) {
  const { space } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap: space[gap],
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
      {...rest}
    />
  );
}
