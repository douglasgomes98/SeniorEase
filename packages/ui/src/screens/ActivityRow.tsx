import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Button } from "../components/Button";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";

export interface ActivityRowViewModel {
  id: string;
  /** Renderizado apenas como Text (nunca como markup). */
  title: string;
  statusLabel: string;
  /** Vencimento ja formatado no idioma; ausente quando nao ha data. */
  dueLabel?: string;
  /** Contagem de passos ja formatada; ausente quando nao ha passos. */
  stepsLabel?: string;
  /** Rotulo da acao Iniciar (abre a execucao guiada). */
  startLabel: string;
  /** Nome acessivel por item da acao Iniciar ("Iniciar {title}"). */
  startA11y: string;
  markDoneLabel: string;
  markDoneA11y: string;
  deleteLabel: string;
  deleteA11y: string;
}

export interface ActivityRowProps {
  row: ActivityRowViewModel;
  /** Abre o runner guiado da atividade. */
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Item da lista de atividades (apresentacional). Mostra o titulo como texto
 * puro com o status, o vencimento formatado (quando ha) e a contagem de passos,
 * mais as acoes Iniciar (execucao guiada), Concluir e Excluir com nomes
 * acessiveis por item e alvos de toque generosos. Puro e dirigido por props -
 * sem regra de negocio nem i18n.
 */
export function ActivityRow({
  row,
  onStart,
  onComplete,
  onDelete,
}: ActivityRowProps) {
  const { colors, space, radii } = useTheme();

  return (
    <View
      testID={`activity-row-${row.id}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.line,
        borderWidth: 2,
        borderRadius: radii.lg,
        padding: space.lg,
        gap: space.md,
      }}
    >
      <Text variant="title">{row.title}</Text>

      <Stack direction="row" gap="md">
        <Text variant="caption" muted>
          {row.statusLabel}
        </Text>
        {row.stepsLabel ? (
          <Text variant="caption" muted>
            {row.stepsLabel}
          </Text>
        ) : null}
      </Stack>

      {row.dueLabel ? <Text variant="body">{row.dueLabel}</Text> : null}

      <Button
        label={row.startLabel}
        variant="primary"
        onPress={() => onStart(row.id)}
        accessibilityLabel={row.startA11y}
        testID={`activity-start-${row.id}`}
      />

      <Stack direction="row" gap="sm">
        <Button
          label={row.markDoneLabel}
          variant="primary"
          onPress={() => onComplete(row.id)}
          accessibilityLabel={row.markDoneA11y}
          testID={`activity-complete-${row.id}`}
          style={{ flexGrow: 1, flexBasis: 0 }}
        />
        <Button
          label={row.deleteLabel}
          variant="danger"
          onPress={() => onDelete(row.id)}
          accessibilityLabel={row.deleteA11y}
          testID={`activity-delete-${row.id}`}
          style={{ flexGrow: 1, flexBasis: 0 }}
        />
      </Stack>
    </View>
  );
}
