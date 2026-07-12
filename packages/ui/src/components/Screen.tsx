import { type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useTheme } from "../theme/theme-context";

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  testID?: string;
}

/**
 * Container de tela: aplica a cor de fundo do tema e um respiro generoso ja
 * escalado pela preferencia de espacamento. Puro, dirigido por props.
 */
export function Screen({ children, scroll = true, testID }: ScreenProps) {
  const { colors, space } = useTheme();

  const content = (
    <View style={{ padding: space.lg, gap: space.lg, flexGrow: 1 }}>
      {children}
    </View>
  );

  if (!scroll) {
    return (
      <View testID={testID} style={{ flex: 1, backgroundColor: colors.bg }}>
        {content}
      </View>
    );
  }

  return (
    <ScrollView
      testID={testID}
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  );
}
