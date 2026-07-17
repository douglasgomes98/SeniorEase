import { Stack } from "../components/Stack";
import { TourCoachmark } from "./TourCoachmark";
import { TourControls, type TourControlsLabels } from "./TourControls";
import { TourOverlay } from "./TourOverlay";

export interface TourProps {
  active: boolean;
  title: string;
  description: string;
  isFirst: boolean;
  isLast: boolean;
  labels: TourControlsLabels;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
}

/**
 * Composicao do tour guiado (overlay + balao + controles). Puro e dirigido por
 * props: quando exibir, a progressao e a copia vivem fora da UI.
 */
export function Tour({
  active,
  title,
  description,
  isFirst,
  isLast,
  labels,
  onPrevious,
  onNext,
  onSkip,
}: TourProps) {
  if (!active) {
    return null;
  }

  return (
    <TourOverlay>
      <Stack gap="lg">
        <TourCoachmark title={title} description={description} />
        <TourControls
          isFirst={isFirst}
          isLast={isLast}
          labels={labels}
          onPrevious={onPrevious}
          onNext={onNext}
          onSkip={onSkip}
        />
      </Stack>
    </TourOverlay>
  );
}
