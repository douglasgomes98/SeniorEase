import type { TourStep } from "@senior-ease/core";
import type { MessageKey } from "@senior-ease/i18n";

/**
 * Conteudo do tour guiado da Home. O dominio conhece apenas os ids; aqui
 * mapeamos cada passo para as chaves de traducao (i18n).
 */
export interface TourStepContent {
  id: string;
  titleKey: MessageKey;
  descriptionKey: MessageKey;
}

export const HOME_TOUR_CONTENT: TourStepContent[] = [
  {
    id: "welcome",
    titleKey: "tour.step.welcome.title",
    descriptionKey: "tour.step.welcome.description",
  },
  {
    id: "fontSize",
    titleKey: "tour.step.fontSize.title",
    descriptionKey: "tour.step.fontSize.description",
  },
  {
    id: "contrast",
    titleKey: "tour.step.contrast.title",
    descriptionKey: "tour.step.contrast.description",
  },
];

export const HOME_TOUR_STEPS: TourStep[] = HOME_TOUR_CONTENT.map((step) => ({
  id: step.id,
}));

const CONTENT_BY_ID = new Map<string, TourStepContent>(
  HOME_TOUR_CONTENT.map((step) => [step.id, step]),
);

export function tourStepContent(id: string): TourStepContent | null {
  return CONTENT_BY_ID.get(id) ?? null;
}
