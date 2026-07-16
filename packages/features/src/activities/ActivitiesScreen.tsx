import { useState } from "react";
import { View } from "react-native";
import {
  ACTIVITIES_MAX,
  ACTIVITY_DESCRIPTION_MAX_LENGTH,
  ACTIVITY_STEPS_MAX,
  ACTIVITY_STEP_MAX_LENGTH,
  ACTIVITY_TITLE_MAX_LENGTH,
  addActivity,
  completeActivity,
  createActivity,
  deleteActivity,
  isBlankTitle,
  nextActivityId,
  sortActivities,
  useActivities,
  useConfirm,
  useFeedback,
  usePreferences,
  type ActivityDraft,
} from "@senior-ease/core";
import { useTranslation } from "@senior-ease/i18n";
import {
  ActivitiesListView,
  type ActivityFormViewModel,
  type ActivityRowViewModel,
} from "@senior-ease/ui";
import { ActivityRunner } from "./ActivityRunner";

const EMPTY_DRAFT: ActivityDraft = {
  title: "",
  description: "",
  steps: [],
  due: "",
};

/** Formata o vencimento ISO local no idioma atual; "" quando invalido. */
function formatDue(due: string, locale: string): string {
  const date = new Date(due);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Container das Atividades. Le a lista, a hidratacao e o sinalizador de falha de
 * persistencia da store (F03); mantem o estado local do formulario. Ao salvar,
 * valida o titulo (senao mostra erro inline), constroi a atividade com as
 * operacoes puras do dominio, persiste a lista re-ordenada via replaceActivities
 * e confirma via feedback (F05); ao concluir, persiste e anuncia feedback
 * positivo; ao excluir, passa pelo portao de confirmacao (F06) e so entao
 * persiste e anuncia. Deriva a lista pendente, formata o vencimento no idioma e
 * resolve toda a copia por i18n antes de entregar a view. As regras vivem no core.
 */
export function ActivitiesScreen() {
  const t = useTranslation();

  const activities = useActivities((state) => state.activities);
  const isHydrated = useActivities((state) => state.isHydrated);
  const persistenceError = useActivities((state) => state.persistenceError);
  const replaceActivities = useActivities((state) => state.replaceActivities);
  const locale = usePreferences((state) => state.locale);
  const announce = useFeedback((state) => state.announce);
  const confirm = useConfirm();

  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<ActivityDraft>(EMPTY_DRAFT);
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  // Id efemero da atividade em execucao guiada; nao persistido.
  const [runningId, setRunningId] = useState<string | null>(null);

  const openForm = () => setExpanded(true);

  const start = (id: string) => setRunningId(id);

  const cancelForm = () => {
    setExpanded(false);
    setDraft(EMPTY_DRAFT);
    setTitleError(undefined);
  };

  // Limpa o erro assim que o titulo deixa de estar em branco (feedback imediato).
  const changeDraft = (next: ActivityDraft) => {
    setDraft(next);
    if (titleError && !isBlankTitle(next.title)) {
      setTitleError(undefined);
    }
  };

  const submit = () => {
    if (isBlankTitle(draft.title)) {
      setTitleError(t("activities.form.titleRequired"));
      return;
    }
    const activity = createActivity(draft, nextActivityId(), Date.now());
    const added = addActivity(activities, activity);
    // Teto atingido: a lista nao muda e o aviso de limite ja esta na tela.
    if (added.length === activities.length) {
      return;
    }
    replaceActivities(sortActivities(added));
    announce(t("feedback.activityCreated"));
    setExpanded(false);
    setDraft(EMPTY_DRAFT);
    setTitleError(undefined);
  };

  const complete = (id: string) => {
    const target = activities.find((activity) => activity.id === id);
    if (!target) {
      return;
    }
    const next = activities.map((activity) =>
      activity.id === id ? completeActivity(activity, Date.now()) : activity,
    );
    replaceActivities(sortActivities(next));
    announce(t("feedback.activityCompleted"));
  };

  const remove = async (id: string) => {
    const target = activities.find((activity) => activity.id === id);
    if (!target) {
      return;
    }
    const confirmed = await confirm({
      title: t("confirm.deleteActivity.title"),
      message: t("confirm.deleteActivity.message", { title: target.title }),
      confirmLabel: t("confirm.deleteActivity.confirm"),
      cancelLabel: t("common.cancel"),
      tone: "danger",
    });
    if (!confirmed) {
      return;
    }
    replaceActivities(deleteActivity(activities, id));
    announce(t("feedback.activityDeleted"));
  };

  const pending = activities.filter((activity) => activity.status === "pending");
  const rows: ActivityRowViewModel[] = sortActivities(pending).map((activity) => {
    const dueLabel = activity.due ? formatDue(activity.due, locale) : "";
    return {
      id: activity.id,
      title: activity.title,
      statusLabel: t("activities.item.status.pending"),
      dueLabel: dueLabel ? t("activities.item.due", { date: dueLabel }) : undefined,
      stepsLabel:
        activity.steps.length > 0
          ? t("activities.item.stepsCount", { count: activity.steps.length })
          : undefined,
      startLabel: t("activities.item.start"),
      startA11y: t("activities.item.startA11y", { title: activity.title }),
      markDoneLabel: t("activities.item.markDone"),
      markDoneA11y: t("activities.item.markDoneA11y", { title: activity.title }),
      deleteLabel: t("activities.item.delete"),
      deleteA11y: t("activities.item.deleteA11y", { title: activity.title }),
    };
  });

  const atLimit = activities.length >= ACTIVITIES_MAX;

  const form: ActivityFormViewModel = {
    expanded,
    draft,
    titleError,
    canAddStep: draft.steps.length < ACTIVITY_STEPS_MAX,
    maxLengths: {
      title: ACTIVITY_TITLE_MAX_LENGTH,
      description: ACTIVITY_DESCRIPTION_MAX_LENGTH,
      step: ACTIVITY_STEP_MAX_LENGTH,
    },
    stepPlaceholder: t("activities.form.stepPlaceholder"),
    removeStepA11y: t("activities.form.removeStepA11y"),
    labels: {
      titleLabel: t("activities.form.titleLabel"),
      titlePlaceholder: t("activities.form.titlePlaceholder"),
      descriptionLabel: t("activities.form.descriptionLabel"),
      descriptionPlaceholder: t("activities.form.descriptionPlaceholder"),
      stepsLabel: t("activities.form.stepsLabel"),
      addStep: t("activities.form.addStep"),
      removeStep: t("activities.form.removeStep"),
      dueLabel: t("activities.form.dueLabel"),
      dueClear: t("activities.form.dueClear"),
      save: t("activities.form.save"),
      cancel: t("common.cancel"),
    },
  };

  // So executa uma atividade ainda pendente; concluidas saem da lista pendente.
  const running =
    runningId !== null
      ? activities.find(
          (activity) =>
            activity.id === runningId && activity.status === "pending",
        )
      : undefined;

  return (
    <View style={{ flex: 1 }}>
      <ActivitiesListView
        header={t("activities.header")}
        hydrated={isHydrated}
        rows={rows}
        emptyLabel={t("activities.list.empty")}
        addOpenLabel={t("activities.add.open")}
        saveFailedNotice={
          persistenceError ? t("activities.notice.saveFailed") : undefined
        }
        limitNotice={atLimit ? t("activities.notice.limitReached") : undefined}
        form={form}
        onOpenForm={openForm}
        onCancelForm={cancelForm}
        onDraftChange={changeDraft}
        onSubmit={submit}
        onStart={start}
        onComplete={complete}
        onDelete={remove}
      />
      {running ? (
        <ActivityRunner
          activity={running}
          onClose={() => setRunningId(null)}
        />
      ) : null}
    </View>
  );
}
