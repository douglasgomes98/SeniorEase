/**
 * Value objects do Tour guiado (fluxo passo a passo, requisito nao funcional
 * obrigatorio). Toda a regra de progressao vive aqui, em funcoes puras.
 */
/**
 * Passo do tour identificado apenas por id. O texto exibido e resolvido por
 * i18n na camada de feature - o dominio nao guarda copia traduzida.
 */
export interface TourStep {
  id: string;
}

export interface TourProgress {
  currentIndex: number;
  totalSteps: number;
  isActive: boolean;
  finished: boolean;
}

export function idleTourProgress(totalSteps: number): TourProgress {
  return { currentIndex: 0, totalSteps, isActive: false, finished: false };
}

export function startTour(totalSteps: number): TourProgress {
  return {
    currentIndex: 0,
    totalSteps,
    isActive: totalSteps > 0,
    finished: totalSteps === 0,
  };
}

export function advanceTour(progress: TourProgress): TourProgress {
  if (!progress.isActive) {
    return progress;
  }
  const nextIndex = progress.currentIndex + 1;
  if (nextIndex >= progress.totalSteps) {
    return {
      ...progress,
      currentIndex: Math.max(0, progress.totalSteps - 1),
      isActive: false,
      finished: true,
    };
  }
  return { ...progress, currentIndex: nextIndex };
}

export function regressTour(progress: TourProgress): TourProgress {
  if (!progress.isActive) {
    return progress;
  }
  return { ...progress, currentIndex: Math.max(0, progress.currentIndex - 1) };
}

export function finishTour(progress: TourProgress): TourProgress {
  return { ...progress, isActive: false, finished: true };
}

export function isFirstStep(progress: TourProgress): boolean {
  return progress.currentIndex <= 0;
}

export function isLastStep(progress: TourProgress): boolean {
  return progress.currentIndex >= progress.totalSteps - 1;
}
