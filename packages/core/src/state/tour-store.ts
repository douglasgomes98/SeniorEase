import { create, type StoreApi, type UseBoundStore } from "zustand";
import {
  advanceTour,
  finishTour,
  idleTourProgress,
  isFirstStep,
  isLastStep,
  regressTour,
  startTour,
  type TourProgress,
  type TourStep,
} from "../domain/tour-progress";

export interface TourState {
  steps: TourStep[];
  progress: TourProgress;
  begin: () => void;
  next: () => void;
  previous: () => void;
  skip: () => void;
  currentStep: () => TourStep | null;
  isFirst: () => boolean;
  isLast: () => boolean;
}

export interface TourStoreDeps {
  steps: TourStep[];
  /** Efeito colateral de persistencia injetado (marcar tour como concluido). */
  onFinish: () => void;
}

export type TourStore = UseBoundStore<StoreApi<TourState>>;

/**
 * Fabrica da store do Tour. A progressao usa as funcoes puras do dominio; a
 * conclusao dispara o efeito injetado (persistir "tour concluido"), mantendo a
 * store desacoplada de como a persistencia acontece.
 */
export function createTourStore(deps: TourStoreDeps): TourStore {
  return create<TourState>((set, get) => ({
    steps: deps.steps,
    progress: idleTourProgress(deps.steps.length),
    begin: (): void => {
      set({ progress: startTour(get().steps.length) });
    },
    next: (): void => {
      const updated = advanceTour(get().progress);
      set({ progress: updated });
      if (updated.finished) {
        deps.onFinish();
      }
    },
    previous: (): void => {
      set({ progress: regressTour(get().progress) });
    },
    skip: (): void => {
      set({ progress: finishTour(get().progress) });
      deps.onFinish();
    },
    currentStep: (): TourStep | null => {
      const { steps, progress } = get();
      return steps[progress.currentIndex] ?? null;
    },
    isFirst: (): boolean => isFirstStep(get().progress),
    isLast: (): boolean => isLastStep(get().progress),
  }));
}
