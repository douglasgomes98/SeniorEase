import { useEffect, useState } from "react";
import {
  advanceStep,
  completeActivity,
  hasSteps,
  isAtFirstStep,
  isAtLastStep,
  regressStep,
  sortActivities,
  startStepProgress,
  useActivities,
  useFeedback,
  type Activity,
  type StepProgress,
} from "@senior-ease/core";
import { useTranslation } from "@senior-ease/i18n";
import {
  ActivityRunnerView,
  type ActivityRunnerViewLabels,
} from "@senior-ease/ui";

export interface ActivityRunnerProps {
  /** Atividade em execucao (pendente); percorrida em modo leitura. */
  activity: Activity;
  /** Fecha o runner (apos concluir ou ao sair sem concluir). */
  onClose: () => void;
}

/**
 * Container da execucao guiada. Recebe a atividade em execucao e um callback de
 * fechamento; mantem o cursor de passos em estado local (efemero) e o move pelas
 * funcoes puras do dominio (step-progress). Anuncia cada passo ao leitor de tela
 * e, ao concluir - no ultimo passo ou no painel sem passos -, reusa a
 * operacao pura completeActivity, persiste a lista reordenada via
 * replaceActivities, anuncia o feedback positivo e fecha. Resolve toda a
 * copia por i18n e entrega strings prontas a view. As regras vivem no core.
 */
export function ActivityRunner({ activity, onClose }: ActivityRunnerProps) {
  const t = useTranslation();
  const activities = useActivities((state) => state.activities);
  const replaceActivities = useActivities((state) => state.replaceActivities);
  const announce = useFeedback((state) => state.announce);

  const [progress, setProgress] = useState<StepProgress>(() =>
    startStepProgress(activity.steps.length),
  );

  const stepsExist = hasSteps(progress);
  const isFirst = isAtFirstStep(progress);
  const isLast = isAtLastStep(progress);
  // O cursor mantem o indice sempre dentro dos limites; "" cobre o caso sem passos.
  const stepText = activity.steps[progress.currentIndex] ?? "";

  // Anuncia o passo atual ao abrir e a cada troca (indicador + texto do passo).
  useEffect(() => {
    if (!stepsExist) {
      return;
    }
    announce(
      t("activities.runner.stepAnnounce", {
        current: progress.currentIndex + 1,
        total: progress.totalSteps,
        text: stepText,
      }),
    );
  }, [progress.currentIndex]);

  const finish = () => {
    const next = activities.map((item) =>
      item.id === activity.id ? completeActivity(item, Date.now()) : item,
    );
    replaceActivities(sortActivities(next));
    announce(t("feedback.activityCompleted"));
    onClose();
  };

  const goPrevious = () => setProgress((current) => regressStep(current));

  // Botao primario: avanca, ou conclui quando ja esta no ultimo passo.
  const goNext = () => {
    if (isLast) {
      finish();
      return;
    }
    setProgress((current) => advanceStep(current));
  };

  const labels: ActivityRunnerViewLabels = {
    step: stepsExist
      ? t("activities.runner.step", {
          current: progress.currentIndex + 1,
          total: progress.totalSteps,
        })
      : "",
    previous: t("activities.runner.previous"),
    next: t("activities.runner.next"),
    finish: t("activities.runner.finish"),
    noSteps: t("activities.runner.noSteps"),
    close: t("activities.runner.close"),
  };

  return (
    <ActivityRunnerView
      header={activity.title}
      hasSteps={stepsExist}
      stepText={stepText}
      isFirst={isFirst}
      isLast={isLast}
      labels={labels}
      onPrevious={goPrevious}
      onNext={goNext}
      onFinish={finish}
      onClose={onClose}
    />
  );
}
