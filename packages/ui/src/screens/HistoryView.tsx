import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";
import { HistoryRow, type HistoryRowViewModel } from "./HistoryRow";

export interface HistoryViewProps {
  header: string;
  hydrated: boolean;
  /** Concluidas, mais recente primeiro, limitadas ao teto de retencao. */
  rows: HistoryRowViewModel[];
  emptyLabel: string;
  /** Presente apenas quando ha historico a limpar. */
  clearLabel?: string;
  /** Mostrado quando a persistencia falhou (persistenceError). */
  saveFailedNotice?: string;
  onClear: () => void;
}

/**
 * Tela de Historico (cross unica Web + Mobile). 100% apresentacional: recebe
 * copia traduzida e callbacks por props. Reune o cabecalho, um aviso gentil de
 * falha ao salvar, a lista de uma coluna de concluidas (ou o estado vazio) e a
 * acao Limpar historico (variante danger), exibida so quando ha o que limpar.
 * Nenhuma regra de negocio nem i18n aqui dentro.
 */
export function HistoryView(props: HistoryViewProps) {
  const { header, hydrated, rows, emptyLabel, clearLabel, saveFailedNotice, onClear } =
    props;
  const { colors, space, radii } = useTheme();

  return (
    <Screen testID="history-screen">
      <Text variant="heading" accessibilityRole="header">
        {header}
      </Text>

      {saveFailedNotice ? (
        <View
          accessibilityRole="alert"
          style={{
            backgroundColor: colors.dangerSoft,
            borderColor: colors.danger,
            borderWidth: 2,
            borderRadius: radii.md,
            padding: space.md,
          }}
        >
          <Text variant="body">{saveFailedNotice}</Text>
        </View>
      ) : null}

      {!hydrated ? null : rows.length === 0 ? (
        <Text variant="body" muted>
          {emptyLabel}
        </Text>
      ) : (
        <Stack gap="md">
          {rows.map((row) => (
            <HistoryRow key={row.id} row={row} />
          ))}
        </Stack>
      )}

      {clearLabel ? (
        <Button
          label={clearLabel}
          variant="danger"
          onPress={onClear}
          testID="history-clear"
        />
      ) : null}
    </Screen>
  );
}
