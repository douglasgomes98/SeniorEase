/**
 * Value object da execucao guiada: um cursor puro sobre os passos ordenados de
 * uma atividade. Toda a regra de navegacao (avancar, voltar, deteccao de
 * primeiro/ultimo e presenca de passos) vive aqui, em funcoes puras e sem estado
 * global - o container mantem o cursor em estado local e o muta por estas
 * funcoes. E analogo ao tour-progress, porem desacoplado da semantica do tour
 * (isActive/finished) e com nomes distintos para conviver no barrel do dominio.
 */
export interface StepProgress {
  /** Cursor 0-based sobre os passos. */
  currentIndex: number;
  /** Quantidade de passos da atividade. */
  totalSteps: number;
}

/** Inicia o cursor no primeiro passo a partir da contagem de passos. */
export function startStepProgress(totalSteps: number): StepProgress {
  return { currentIndex: 0, totalSteps };
}

/** Avanca um passo, sem ultrapassar o ultimo indice. */
export function advanceStep(progress: StepProgress): StepProgress {
  const lastIndex = Math.max(0, progress.totalSteps - 1);
  return {
    ...progress,
    currentIndex: Math.min(progress.currentIndex + 1, lastIndex),
  };
}

/** Retrocede um passo, sem passar do primeiro indice. */
export function regressStep(progress: StepProgress): StepProgress {
  return {
    ...progress,
    currentIndex: Math.max(0, progress.currentIndex - 1),
  };
}

/** Verdadeiro no primeiro passo (Anterior deve ficar desabilitado). */
export function isAtFirstStep(progress: StepProgress): boolean {
  return progress.currentIndex <= 0;
}

/** Verdadeiro no ultimo passo (o botao primario passa a ser Concluir). */
export function isAtLastStep(progress: StepProgress): boolean {
  return progress.currentIndex >= progress.totalSteps - 1;
}

/** Verdadeiro quando ha ao menos um passo para percorrer. */
export function hasSteps(progress: StepProgress): boolean {
  return progress.totalSteps > 0;
}
