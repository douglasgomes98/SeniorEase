import { useMemo } from "react";
import {
  collectDueBuckets,
  shouldSurfaceInApp,
  useActivities,
  usePreferences,
  useReminders,
} from "@senior-ease/core";
import { useTranslation } from "@senior-ease/i18n";
import type { BadgeTone, ReminderBannerProps } from "@senior-ease/ui";

/** Etiqueta de lembrete resolvida para uma linha da lista. */
export type ReminderBadge = { label: string; tone: BadgeTone } | undefined;

export interface ReminderSummary {
  /** Banner ja traduzido para a tela; null quando nao ha nada a mostrar. */
  banner: ReminderBannerProps | null;
  /** Resolve a etiqueta chegando/atrasada de uma atividade (ou nenhuma). */
  badgeFor: (activityId: string) => ReminderBadge;
}

export interface ReminderSummaryOptions {
  /** Acao "ver atividades" no banner; anexada so onde faz sentido (Home). */
  onViewActivities?: () => void;
}

/**
 * Seletor de aviso dentro do app (F12). Le a lista (F09), as preferencias de
 * notificacao (F03) e o estado efemero de permissao/disponibilidade da store,
 * calcula os baldes puros de chegando/atrasado e aplica a regra de canal +
 * permissao (com atraso sempre visivel e degradacao para o app quando o sistema
 * esta indisponivel). Deriva o banner (contagens, tom e o aviso de permissao
 * negada/indisponivel) e um resolvedor de etiqueta por atividade. Toda copia sai
 * traduzida; nenhuma regra de negocio vive na UI.
 */
export function useReminderSummary(
  options: ReminderSummaryOptions = {},
): ReminderSummary {
  const t = useTranslation();
  const activities = useActivities((state) => state.activities);
  const notifications = usePreferences((state) => state.notifications);
  const permission = useReminders((state) => state.permission);
  const osUnavailable = useReminders((state) => state.osUnavailable);
  const supported = useReminders((state) => state.supported);

  const { onViewActivities } = options;

  return useMemo<ReminderSummary>(() => {
    // Desligado: nada a avisar (a store cancela o agendamento do sistema).
    if (!notifications.enabled) {
      return { banner: null, badgeFor: () => undefined };
    }

    const now = Date.now();
    const buckets = collectDueBuckets(
      activities,
      now,
      notifications.leadTimeMinutes,
    );

    // Entrega pelo sistema desejada (canal os/both) e efetivamente disponivel.
    const wantsOs =
      notifications.channel === "os" || notifications.channel === "both";
    const osAvailable = supported && !osUnavailable && permission === "granted";

    // Chegando segue a regra de canal (degrada para o app quando o sistema cai);
    // atrasado sempre aparece no app enquanto o interruptor estiver ligado.
    const upcomingShown = shouldSurfaceInApp(notifications, osAvailable);

    const upcomingIds = new Set(
      upcomingShown ? buckets.upcoming.map((activity) => activity.id) : [],
    );
    const overdueIds = new Set(
      buckets.overdue.map((activity) => activity.id),
    );

    const upcomingCount = upcomingIds.size;
    const overdueCount = overdueIds.size;

    // Aviso de permissao: so quando o usuario quis o sistema (canal os/both).
    let permissionNote: string | null = null;
    if (wantsOs && permission === "denied") {
      permissionNote = t("reminders.permission.denied");
    } else if (wantsOs && osUnavailable) {
      permissionNote = t("reminders.permission.unavailable");
    }

    const lines: string[] = [];
    if (overdueCount > 0) {
      lines.push(t("reminders.banner.overdue", { count: overdueCount }));
    }
    if (upcomingCount > 0) {
      lines.push(t("reminders.banner.upcoming", { count: upcomingCount }));
    }
    if (permissionNote) {
      lines.push(permissionNote);
    }

    const badgeFor = (activityId: string): ReminderBadge => {
      if (overdueIds.has(activityId)) {
        return { label: t("reminders.badge.overdue"), tone: "danger" };
      }
      if (upcomingIds.has(activityId)) {
        return { label: t("reminders.badge.upcoming"), tone: "info" };
      }
      return undefined;
    };

    if (lines.length === 0) {
      return { banner: null, badgeFor };
    }

    const tone = permissionNote
      ? "warning"
      : overdueCount > 0
        ? "danger"
        : "info";

    const banner: ReminderBannerProps = {
      title: t("reminders.banner.title"),
      message: lines.join("\n"),
      tone,
      action: onViewActivities
        ? {
            label: t("reminders.banner.viewActivities"),
            onPress: onViewActivities,
          }
        : undefined,
    };

    return { banner, badgeFor };
  }, [
    activities,
    notifications,
    permission,
    osUnavailable,
    supported,
    onViewActivities,
    t,
  ]);
}
