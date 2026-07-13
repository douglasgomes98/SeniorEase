import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Button } from "../components/Button";
import { DateTimeField } from "../components/DateTimeField";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";
import { TextField } from "../components/TextField";

/**
 * Rascunho da atividade, tipado estruturalmente aqui para manter a UI
 * desacoplada do core (o container passa o rascunho de dominio equivalente).
 */
export interface ActivityDraft {
  title: string;
  description: string;
  steps: string[];
  due: string;
}

export interface ActivityFormLabels {
  titleLabel: string;
  titlePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  stepsLabel: string;
  addStep: string;
  removeStep: string;
  dueLabel: string;
  dueClear: string;
  save: string;
  cancel: string;
}

export interface ActivityFormViewModel {
  expanded: boolean;
  draft: ActivityDraft;
  /** Definido quando um titulo em branco foi submetido. */
  titleError?: string;
  /** Falso quando o numero maximo de passos foi atingido. */
  canAddStep: boolean;
  maxLengths: { title: number; description: number; step: number };
  /** Template com {number}, preenchido por passo. */
  stepPlaceholder: string;
  /** Template com {number}, preenchido por passo (nome acessivel do remover). */
  removeStepA11y: string;
  labels: ActivityFormLabels;
}

export interface ActivityFormProps {
  form: ActivityFormViewModel;
  onDraftChange: (next: ActivityDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/** Preenche o marcador {number} de um template ja traduzido. */
function fillNumber(template: string, value: number): string {
  return template.replace("{number}", String(value));
}

/**
 * Formulario inline de criacao (apresentacional). Coleta um titulo obrigatorio,
 * uma descricao opcional, uma lista dinamica de passos com adicionar/remover e
 * uma data/hora opcional; expoe Salvar e Cancelar. Mostra o erro de titulo
 * quando pedido e emite o rascunho e a intencao apenas por props - sem regra de
 * negocio nem i18n.
 */
export function ActivityForm({
  form,
  onDraftChange,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const { colors, space, radii } = useTheme();
  const { draft, titleError, canAddStep, maxLengths, labels } = form;

  const setTitle = (title: string) => onDraftChange({ ...draft, title });
  const setDescription = (description: string) =>
    onDraftChange({ ...draft, description });
  const setDue = (due: string) => onDraftChange({ ...draft, due });
  const setStep = (index: number, value: string) =>
    onDraftChange({
      ...draft,
      steps: draft.steps.map((step, current) =>
        current === index ? value : step,
      ),
    });
  const addStep = () =>
    onDraftChange({ ...draft, steps: [...draft.steps, ""] });
  const removeStep = (index: number) =>
    onDraftChange({
      ...draft,
      steps: draft.steps.filter((_, current) => current !== index),
    });

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.line,
        borderWidth: 2,
        borderRadius: radii.lg,
        padding: space.lg,
        gap: space.lg,
      }}
    >
      <TextField
        value={draft.title}
        onChangeText={setTitle}
        label={labels.titleLabel}
        placeholder={labels.titlePlaceholder}
        maxLength={maxLengths.title}
        errorText={titleError}
        testID="activity-title"
      />

      <TextField
        value={draft.description}
        onChangeText={setDescription}
        label={labels.descriptionLabel}
        placeholder={labels.descriptionPlaceholder}
        maxLength={maxLengths.description}
        multiline
        testID="activity-description"
      />

      <Stack gap="sm">
        <Text variant="label">{labels.stepsLabel}</Text>
        {draft.steps.map((step, index) => (
          <View
            key={index}
            style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-end" }}
          >
            <View style={{ flexGrow: 1, flexBasis: 0 }}>
              <TextField
                value={step}
                onChangeText={(value) => setStep(index, value)}
                label={fillNumber(form.stepPlaceholder, index + 1)}
                maxLength={maxLengths.step}
                testID={`activity-step-${index}`}
              />
            </View>
            <Button
              label={labels.removeStep}
              variant="secondary"
              onPress={() => removeStep(index)}
              accessibilityLabel={fillNumber(form.removeStepA11y, index + 1)}
              testID={`activity-step-remove-${index}`}
            />
          </View>
        ))}
        {canAddStep ? (
          <Button
            label={labels.addStep}
            variant="ghost"
            onPress={addStep}
            testID="activity-step-add"
          />
        ) : null}
      </Stack>

      <DateTimeField
        value={draft.due}
        onChange={setDue}
        label={labels.dueLabel}
        clearLabel={labels.dueClear}
        testID="activity-due"
      />

      <Stack direction="row" gap="sm">
        <Button
          label={labels.cancel}
          variant="secondary"
          onPress={onCancel}
          testID="activity-cancel"
          style={{ flexGrow: 1, flexBasis: 0 }}
        />
        <Button
          label={labels.save}
          variant="primary"
          onPress={onSubmit}
          testID="activity-save"
          style={{ flexGrow: 1, flexBasis: 0 }}
        />
      </Stack>
    </View>
  );
}
