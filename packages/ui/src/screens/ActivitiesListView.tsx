import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";
import {
  ReminderBanner,
  type ReminderBannerProps,
} from "../feedback/ReminderBanner";
import {
  ActivityForm,
  type ActivityDraft,
  type ActivityFormViewModel,
} from "./ActivityForm";
import { ActivityRow, type ActivityRowViewModel } from "./ActivityRow";

export interface ActivitiesListViewProps {
  header: string;
  hydrated: boolean;
  /** Atividades pendentes, ja ordenadas. */
  rows: ActivityRowViewModel[];
  emptyLabel: string;
  /** Rotulo do gatilho que abre o formulario. */
  addOpenLabel: string;
  /** Banner de lembretes (F12) no topo; ausente/null quando nao ha o que avisar. */
  reminderBanner?: ReminderBannerProps | null;
  /** Mostrado quando a persistencia falhou (persistenceError). */
  saveFailedNotice?: string;
  /** Mostrado quando o teto de atividades foi atingido. */
  limitNotice?: string;
  form: ActivityFormViewModel;
  onOpenForm: () => void;
  onCancelForm: () => void;
  onDraftChange: (next: ActivityDraft) => void;
  onSubmit: () => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Tela de Atividades (cross unica Web + Mobile). 100% apresentacional: recebe
 * copia traduzida e callbacks por props. Reune o cabecalho, um aviso gentil de
 * falha ao salvar, o formulario inline de criacao (ou o gatilho para abri-lo),
 * a lista de uma coluna com o estado vazio e cada item com Concluir/Excluir.
 * Nenhuma regra de negocio nem i18n aqui dentro.
 */
export function ActivitiesListView(props: ActivitiesListViewProps) {
  const {
    header,
    hydrated,
    rows,
    emptyLabel,
    addOpenLabel,
    reminderBanner,
    saveFailedNotice,
    limitNotice,
    form,
    onOpenForm,
    onCancelForm,
    onDraftChange,
    onSubmit,
    onStart,
    onComplete,
    onDelete,
  } = props;
  const { colors, space, radii } = useTheme();

  return (
    <Screen testID="activities-screen">
      <Text variant="heading" accessibilityRole="header">
        {header}
      </Text>

      {reminderBanner ? (
        <ReminderBanner {...reminderBanner} testID="activities-reminder" />
      ) : null}

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

      {form.expanded ? (
        <ActivityForm
          form={form}
          onDraftChange={onDraftChange}
          onSubmit={onSubmit}
          onCancel={onCancelForm}
        />
      ) : limitNotice ? (
        <Text variant="body" muted>
          {limitNotice}
        </Text>
      ) : (
        <Button
          label={addOpenLabel}
          variant="primary"
          onPress={onOpenForm}
          testID="activity-add-open"
        />
      )}

      {!hydrated ? null : rows.length === 0 ? (
        <Text variant="body" muted>
          {emptyLabel}
        </Text>
      ) : (
        <Stack gap="md">
          {rows.map((row) => (
            <ActivityRow
              key={row.id}
              row={row}
              onStart={onStart}
              onComplete={onComplete}
              onDelete={onDelete}
            />
          ))}
        </Stack>
      )}
    </Screen>
  );
}
