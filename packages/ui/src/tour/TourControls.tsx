import { Button } from "../components/Button";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";

export interface TourControlsLabels {
  /** Indicador de progresso ja formatado e traduzido (ex.: "Passo 1 de 3"). */
  step: string;
  previous: string;
  next: string;
  finish: string;
  skip: string;
}

export interface TourControlsProps {
  isFirst: boolean;
  isLast: boolean;
  labels: TourControlsLabels;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
}

/**
 * Controles do tour: progresso legivel e botoes grandes de navegacao.
 * Puro e agnostico de idioma: toda a copia chega por props (i18n no app).
 */
export function TourControls({
  isFirst,
  isLast,
  labels,
  onPrevious,
  onNext,
  onSkip,
}: TourControlsProps) {
  return (
    <Stack gap="md">
      <Text variant="caption" muted accessibilityLabel={labels.step}>
        {labels.step}
      </Text>
      <Stack direction="row" gap="sm">
        <Button
          label={labels.previous}
          variant="secondary"
          onPress={onPrevious}
          disabled={isFirst}
          style={{ flexGrow: 1, flexBasis: 0 }}
        />
        <Button
          label={isLast ? labels.finish : labels.next}
          variant="primary"
          onPress={onNext}
          style={{ flexGrow: 1, flexBasis: 0 }}
        />
      </Stack>
      <Button label={labels.skip} variant="ghost" onPress={onSkip} />
    </Stack>
  );
}
