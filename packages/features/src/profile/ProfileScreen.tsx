import { useState } from "react";
import {
  DISPLAY_NAME_MAX_LENGTH,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_LEAD_TIMES,
  isQuietHoursTime,
  useConfirm,
  useFeedback,
  useNavigation,
  usePreferences,
  type NotificationChannel,
  type NotificationLeadTime,
} from "@senior-ease/core";
import {
  LOCALES,
  useTranslation,
  type Locale,
  type MessageKey,
} from "@senior-ease/i18n";
import { ProfileView, type ProfileViewProps } from "@senior-ease/ui";

/** Janela padrao de horario silencioso ao ativa-lo (off ate o usuario ligar). */
const DEFAULT_QUIET_HOURS = { start: "22:00", end: "07:00" } as const;

const LEAD_TIME_KEY: Record<NotificationLeadTime, MessageKey> = {
  5: "profile.notifications.leadTime.min5",
  15: "profile.notifications.leadTime.min15",
  30: "profile.notifications.leadTime.min30",
  60: "profile.notifications.leadTime.min60",
  1440: "profile.notifications.leadTime.min1440",
};

const CHANNEL_KEY: Record<NotificationChannel, MessageKey> = {
  "in-app": "profile.notifications.channel.inApp",
  os: "profile.notifications.channel.os",
  both: "profile.notifications.channel.both",
};

/**
 * Container do Perfil. Le tudo o que o app lembra do usuario (F03) - nome,
 * idioma, preferencias de lembretes e os valores de aparencia - alem do
 * sinalizador de falha de persistencia. Mantem rascunhos locais do nome e das
 * horas silenciosas para validar antes de persistir; em cada mudanca chama o
 * setter que persiste e confirma via feedback (F05). O reset passa pelo portao
 * de confirmacao (F06, tom danger) e o atalho de aparencia navega (F04) ao
 * painel. Resolve toda a copia por i18n. As regras vivem no core.
 */
export function ProfileScreen() {
  const t = useTranslation();

  const displayName = usePreferences((state) => state.displayName);
  const locale = usePreferences((state) => state.locale);
  const notifications = usePreferences((state) => state.notifications);
  const fontScale = usePreferences((state) => state.fontScale);
  const contrastLevel = usePreferences((state) => state.contrastLevel);
  const spacingScale = usePreferences((state) => state.spacingScale);
  const navigationMode = usePreferences((state) => state.navigationMode);
  const extraConfirmations = usePreferences((state) => state.extraConfirmations);
  const persistenceError = usePreferences((state) => state.persistenceError);

  const setDisplayName = usePreferences((state) => state.setDisplayName);
  const setLocale = usePreferences((state) => state.setLocale);
  const setNotifications = usePreferences((state) => state.setNotifications);
  const resetToDefaults = usePreferences((state) => state.resetToDefaults);

  const announce = useFeedback((state) => state.announce);
  const confirm = useConfirm();
  const navigate = useNavigation((state) => state.navigate);

  const quietHours = notifications.quietHours;

  // Rascunhos locais: o nome pode passar do limite (mostra o aviso; o dominio
  // apara e corta ao persistir) e as horas podem estar malformadas enquanto o
  // usuario digita (segura o rascunho, so persiste quando o dominio aceita).
  // Semeados do estado ja hidratado (a tela so monta apos a hidratacao) e
  // re-sincronizados no reset.
  const [nameDraft, setNameDraft] = useState(displayName);
  const [quietStartDraft, setQuietStartDraft] = useState(
    quietHours?.start ?? DEFAULT_QUIET_HOURS.start,
  );
  const [quietEndDraft, setQuietEndDraft] = useState(
    quietHours?.end ?? DEFAULT_QUIET_HOURS.end,
  );

  const nameTooLong = nameDraft.trim().length > DISPLAY_NAME_MAX_LENGTH;

  const handleDisplayNameChange = (next: string) => {
    setNameDraft(next);
    setDisplayName(next); // dominio: apara + corta em DISPLAY_NAME_MAX_LENGTH
    announce(t("feedback.displayName"));
  };

  const handleLanguageChange = (next: Locale) => {
    if (next === locale) {
      return;
    }
    setLocale(next);
    announce(t("feedback.language"));
  };

  const handleToggleNotifications = (enabled: boolean) => {
    setNotifications({ enabled });
    announce(t("feedback.notifications"));
  };

  const handleLeadTimeChange = (next: NotificationLeadTime) => {
    if (next === notifications.leadTimeMinutes) {
      return;
    }
    setNotifications({ leadTimeMinutes: next });
    announce(t("feedback.notifications"));
  };

  const handleChannelChange = (next: NotificationChannel) => {
    if (next === notifications.channel) {
      return;
    }
    setNotifications({ channel: next });
    announce(t("feedback.notifications"));
  };

  // Liga/desliga mapeia a janela padrao <-> null (dominio: quietHours e null por
  // padrao). Ao ligar, ressemeia os rascunhos com a janela padrao.
  const handleToggleQuietHours = (enabled: boolean) => {
    if (enabled) {
      setQuietStartDraft(DEFAULT_QUIET_HOURS.start);
      setQuietEndDraft(DEFAULT_QUIET_HOURS.end);
      setNotifications({
        quietHours: {
          start: DEFAULT_QUIET_HOURS.start,
          end: DEFAULT_QUIET_HOURS.end,
        },
      });
    } else {
      setNotifications({ quietHours: null });
    }
    announce(t("feedback.notifications"));
  };

  const handleQuietStartChange = (next: string) => {
    setQuietStartDraft(next);
    if (quietHours && isQuietHoursTime(next)) {
      setNotifications({ quietHours: { start: next, end: quietHours.end } });
      announce(t("feedback.notifications"));
    }
  };

  const handleQuietEndChange = (next: string) => {
    setQuietEndDraft(next);
    if (quietHours && isQuietHoursTime(next)) {
      setNotifications({ quietHours: { start: quietHours.start, end: next } });
      announce(t("feedback.notifications"));
    }
  };

  // Portao de confirmacao numa acao destrutiva (F06, tom danger): confirmado ->
  // reseta, ressincroniza os rascunhos e confirma; cancelado -> nada muda. Com
  // as confirmacoes extras desligadas, o portao resolve direto e a acao segue.
  const handleReset = async () => {
    const confirmed = await confirm({
      title: t("confirm.resetDefaults.title"),
      message: t("confirm.resetDefaults.message"),
      confirmLabel: t("confirm.resetDefaults.confirm"),
      cancelLabel: t("common.cancel"),
      tone: "danger",
    });
    if (!confirmed) {
      return;
    }
    resetToDefaults();
    setNameDraft("");
    setQuietStartDraft(DEFAULT_QUIET_HOURS.start);
    setQuietEndDraft(DEFAULT_QUIET_HOURS.end);
    announce(t("feedback.resetDefaults"));
  };

  const fontScalePercent = Math.round(fontScale * 100);
  const spacingKey: MessageKey =
    spacingScale === 1
      ? "home.spacing.compact"
      : spacingScale === 1.25
        ? "home.spacing.comfortable"
        : "home.spacing.spacious";

  const labels: ProfileViewProps["labels"] = {
    header: t("profile.header"),
    greeting: displayName
      ? t("profile.greeting", { name: displayName })
      : t("profile.greetingGeneric"),
    name: {
      label: t("profile.name.label"),
      placeholder: t("profile.name.placeholder"),
      error: nameTooLong
        ? t("profile.name.tooLong", { max: DISPLAY_NAME_MAX_LENGTH })
        : undefined,
    },
    language: {
      label: t("profile.language.label"),
      options: LOCALES.map((value) => ({
        value,
        label: t(`language.name.${value}`),
      })),
    },
    notifications: {
      title: t("profile.notifications.title"),
      enable: t("profile.notifications.enable"),
      on: t("common.on"),
      off: t("common.off"),
      leadTimeLabel: t("profile.notifications.leadTime.label"),
      leadTimeOptions: NOTIFICATION_LEAD_TIMES.map((value) => ({
        value,
        label: t(LEAD_TIME_KEY[value]),
      })),
      channelLabel: t("profile.notifications.channel.label"),
      channelOptions: NOTIFICATION_CHANNELS.map((value) => ({
        value,
        label: t(CHANNEL_KEY[value]),
      })),
      quietHoursLabel: t("profile.notifications.quietHours.label"),
      quietStartLabel: t("profile.notifications.quietHours.start"),
      quietEndLabel: t("profile.notifications.quietHours.end"),
      quietStartError:
        quietStartDraft && !isQuietHoursTime(quietStartDraft)
          ? t("profile.notifications.quietHours.invalid")
          : undefined,
      quietEndError:
        quietEndDraft && !isQuietHoursTime(quietEndDraft)
          ? t("profile.notifications.quietHours.invalid")
          : undefined,
      osBoundaryNote: t("profile.notifications.osBoundaryNote"),
    },
    appearance: {
      title: t("profile.appearance.title"),
      openPanel: t("profile.appearance.openPanel"),
      rows: [
        {
          label: t("profile.appearance.font"),
          value: t("profile.appearance.fontValue", { percent: fontScalePercent }),
        },
        {
          label: t("profile.appearance.contrast"),
          value: t(
            contrastLevel === "high"
              ? "home.contrast.high"
              : "home.contrast.standard",
          ),
        },
        {
          label: t("profile.appearance.spacing"),
          value: t(spacingKey),
        },
        {
          label: t("profile.appearance.navigation"),
          value: t(
            navigationMode === "simple"
              ? "home.navigation.simple"
              : "home.navigation.standard",
          ),
        },
        {
          label: t("profile.appearance.confirmations"),
          value: t(extraConfirmations ? "common.on" : "common.off"),
        },
      ],
    },
    reset: t("profile.reset.label"),
    saveFailedNotice: persistenceError
      ? t("profile.notice.saveFailed")
      : undefined,
  };

  const values: ProfileViewProps["values"] = {
    displayName: nameDraft,
    locale,
    notifications: {
      enabled: notifications.enabled,
      leadTimeMinutes: notifications.leadTimeMinutes,
      channel: notifications.channel,
      quietHoursEnabled: quietHours !== null,
      quietStart: quietStartDraft,
      quietEnd: quietEndDraft,
    },
  };

  return (
    <ProfileView
      labels={labels}
      values={values}
      onDisplayNameChange={handleDisplayNameChange}
      onLanguageChange={handleLanguageChange}
      onToggleNotifications={handleToggleNotifications}
      onLeadTimeChange={handleLeadTimeChange}
      onChannelChange={handleChannelChange}
      onToggleQuietHours={handleToggleQuietHours}
      onQuietStartChange={handleQuietStartChange}
      onQuietEndChange={handleQuietEndChange}
      onOpenPersonalization={() => navigate("personalization")}
      onReset={handleReset}
    />
  );
}
