import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Text } from "../components/Text";

export interface HistoryRowViewModel {
  id: string;
  /** Renderizado apenas como Text (nunca como markup). */
  title: string;
  /** Data/hora de conclusao ja formatada no idioma atual. */
  completedAtLabel: string;
}

export interface HistoryRowProps {
  row: HistoryRowViewModel;
}

/**
 * Item do historico (apresentacional). So-leitura: mostra o titulo como texto
 * puro e a data/hora de conclusao ja formatada, espelhando o estilo do
 * ActivityRow sem nenhuma acao por item. Puro e dirigido por props - sem regra
 * de negocio nem i18n.
 */
export function HistoryRow({ row }: HistoryRowProps) {
  const { colors, space, radii } = useTheme();

  return (
    <View
      testID={`history-row-${row.id}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.line,
        borderWidth: 2,
        borderRadius: radii.lg,
        padding: space.lg,
        gap: space.sm,
      }}
    >
      <Text variant="title">{row.title}</Text>
      <Text variant="caption" muted>
        {row.completedAtLabel}
      </Text>
    </View>
  );
}
