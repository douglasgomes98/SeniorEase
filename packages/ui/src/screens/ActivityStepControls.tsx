import { Button } from "../components/Button";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";

export interface ActivityStepControlsLabels {
  /** Indicador ja formatado e traduzido (ex.: "Passo 2 de 4"). */
  step: string;
  previous: string;
  next: string;
  finish: string;
}

export interface ActivityStepControlsProps {
  isFirst: boolean;
  isLast: boolean;
  labels: ActivityStepControlsLabels;
  onPrevious: () => void;
  /** Botao primario: o container avanca, ou conclui quando isLast. */
  onNext: () => void;
}

/**
 * Controles do runner: o indicador legivel "passo X de Y" e os botoes grandes
 * Anterior / Proximo / Concluir. Anterior fica desabilitado no primeiro passo e
 * o primario passa a Concluir no ultimo. Analogo aos controles do tour, porem
 * proprio desta feature. Puro e agnostico de idioma: a copia chega por props.
 */
export function ActivityStepControls({
  isFirst,
  isLast,
  labels,
  onPrevious,
  onNext,
}: ActivityStepControlsProps) {
  return (
    <Stack gap="md">
      <Text variant="label" accessibilityLabel={labels.step}>
        {labels.step}
      </Text>
      <Stack direction="row" gap="sm">
        <Button
          label={labels.previous}
          variant="secondary"
          onPress={onPrevious}
          disabled={isFirst}
          testID="activity-runner-previous"
          style={{ flexGrow: 1, flexBasis: 0 }}
        />
        <Button
          label={isLast ? labels.finish : labels.next}
          variant="primary"
          onPress={onNext}
          testID="activity-runner-next"
          style={{ flexGrow: 1, flexBasis: 0 }}
        />
      </Stack>
    </Stack>
  );
}
