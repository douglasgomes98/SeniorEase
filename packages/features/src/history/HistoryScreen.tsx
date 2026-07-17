import {
  clearCompletedActivities,
  listHistory,
  useActivities,
  useConfirm,
  useFeedback,
  usePreferences,
} from "@senior-ease/core";
import { useTranslation } from "@senior-ease/i18n";
import { HistoryView, type HistoryRowViewModel } from "@senior-ease/ui";

/** Formata a conclusao (epoch ms) no idioma atual: data (com ano) + hora. */
function formatCompletedAt(completedAt: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(completedAt));
}

/**
 * Container do Historico. Le a lista, a hidratacao e o sinalizador de falha de
 * persistencia da store e o idioma das preferencias. Deriva as
 * concluidas via a projecao pura listHistory (mais recente primeiro, teto de
 * retencao), formata cada conclusao no idioma e monta os view-models. Ao limpar,
 * passa pelo portao de confirmacao (tom danger) e so entao persiste a lista
 * sem as concluidas via replaceActivities (mesmo idioma de excluir/persistir da
 * lista) e anuncia via feedback. Expoe o Limpar so quando ha historico e
 * resolve toda a copia por i18n. As regras vivem no core.
 */
export function HistoryScreen() {
  const t = useTranslation();

  const activities = useActivities((state) => state.activities);
  const isHydrated = useActivities((state) => state.isHydrated);
  const persistenceError = useActivities((state) => state.persistenceError);
  const replaceActivities = useActivities((state) => state.replaceActivities);
  const locale = usePreferences((state) => state.locale);
  const announce = useFeedback((state) => state.announce);
  const confirm = useConfirm();

  const rows: HistoryRowViewModel[] = listHistory(activities).map((activity) => ({
    id: activity.id,
    title: activity.title,
    completedAtLabel: t("history.item.completedAt", {
      date: formatCompletedAt(activity.completedAt ?? 0, locale),
    }),
  }));

  const clear = async () => {
    const confirmed = await confirm({
      title: t("confirm.clearHistory.title"),
      message: t("confirm.clearHistory.message"),
      confirmLabel: t("confirm.clearHistory.confirm"),
      cancelLabel: t("common.cancel"),
      tone: "danger",
    });
    if (!confirmed) {
      return;
    }
    replaceActivities(clearCompletedActivities(activities));
    announce(t("feedback.historyCleared"));
  };

  return (
    <HistoryView
      header={t("history.header")}
      hydrated={isHydrated}
      rows={rows}
      emptyLabel={t("history.list.empty")}
      clearLabel={rows.length > 0 ? t("history.clear.label") : undefined}
      saveFailedNotice={
        persistenceError ? t("history.notice.saveFailed") : undefined
      }
      onClear={clear}
    />
  );
}
