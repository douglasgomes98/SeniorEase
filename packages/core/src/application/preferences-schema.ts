import { isLocale } from "@senior-ease/i18n";
import { isContrastLevel } from "../domain/contrast-level";
import { isNavigationMode } from "../domain/navigation-mode";
import { clampFontScale } from "../domain/font-scale";
import { normalizeSpacingScale } from "../domain/spacing-scale";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  isNotificationChannel,
  isNotificationLeadTime,
  isQuietHoursTime,
  type NotificationPreferences,
  type QuietHours,
} from "../domain/notification-preferences";
import {
  DEFAULT_PREFERENCES,
  normalizeDisplayName,
  type Preferences,
} from "../domain/preferences";

/**
 * Validacao de fronteira das configuracoes. Todo dado vindo do armazenamento e
 * tratado como nao confiavel. A degradacao e campo a campo: um campo invalido
 * cai para o seu padrao seguro, sem descartar o registro inteiro - assim um
 * unico campo corrompido nunca zera toda a configuracao. A versao do formato
 * vive no envelope de persistencia, nao aqui.
 */

/** Forma persistida das configuracoes (identica a Preferences; sem versao). */
export type PersistedSettings = Preferences;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseQuietHours(raw: unknown): QuietHours | null {
  if (!isPlainObject(raw)) {
    return null;
  }
  if (isQuietHoursTime(raw.start) && isQuietHoursTime(raw.end)) {
    return { start: raw.start, end: raw.end };
  }
  return null;
}

/**
 * Coage o grupo de notificacoes campo a campo. Um grupo ausente ou invalido cai
 * inteiro para os padroes; um subcampo invalido cai apenas ele.
 */
function parseNotifications(raw: unknown): NotificationPreferences {
  if (!isPlainObject(raw)) {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
  return {
    enabled:
      typeof raw.enabled === "boolean"
        ? raw.enabled
        : DEFAULT_NOTIFICATION_PREFERENCES.enabled,
    leadTimeMinutes: isNotificationLeadTime(raw.leadTimeMinutes)
      ? raw.leadTimeMinutes
      : DEFAULT_NOTIFICATION_PREFERENCES.leadTimeMinutes,
    channel: isNotificationChannel(raw.channel)
      ? raw.channel
      : DEFAULT_NOTIFICATION_PREFERENCES.channel,
    quietHours: parseQuietHours(raw.quietHours),
  };
}

/**
 * Converte um payload desconhecido (fatia "settings" do envelope) em Preferences
 * validas, coagindo cada campo. Retorna null apenas quando a fatia nem sequer e
 * um objeto - nesse caso quem chama aplica os padroes. Uma fatia-objeto sempre
 * produz Preferences (no limite, tudo padrao), nunca null.
 */
export function parseSettings(raw: unknown): Preferences | null {
  if (!isPlainObject(raw)) {
    return null;
  }
  return {
    locale: isLocale(raw.locale) ? raw.locale : DEFAULT_PREFERENCES.locale,
    fontScale:
      typeof raw.fontScale === "number"
        ? clampFontScale(raw.fontScale)
        : DEFAULT_PREFERENCES.fontScale,
    contrastLevel: isContrastLevel(raw.contrastLevel)
      ? raw.contrastLevel
      : DEFAULT_PREFERENCES.contrastLevel,
    spacingScale: normalizeSpacingScale(raw.spacingScale),
    navigationMode: isNavigationMode(raw.navigationMode)
      ? raw.navigationMode
      : DEFAULT_PREFERENCES.navigationMode,
    reinforcedFeedback:
      typeof raw.reinforcedFeedback === "boolean"
        ? raw.reinforcedFeedback
        : DEFAULT_PREFERENCES.reinforcedFeedback,
    extraConfirmations:
      typeof raw.extraConfirmations === "boolean"
        ? raw.extraConfirmations
        : DEFAULT_PREFERENCES.extraConfirmations,
    tourCompleted:
      typeof raw.tourCompleted === "boolean"
        ? raw.tourCompleted
        : DEFAULT_PREFERENCES.tourCompleted,
    displayName:
      typeof raw.displayName === "string"
        ? normalizeDisplayName(raw.displayName)
        : DEFAULT_PREFERENCES.displayName,
    notifications: parseNotifications(raw.notifications),
  };
}

/** Projeta as configuracoes para a forma persistida (sem chaves extras). */
export function toPersistedSettings(preferences: Preferences): PersistedSettings {
  return {
    locale: preferences.locale,
    fontScale: preferences.fontScale,
    contrastLevel: preferences.contrastLevel,
    spacingScale: preferences.spacingScale,
    navigationMode: preferences.navigationMode,
    reinforcedFeedback: preferences.reinforcedFeedback,
    extraConfirmations: preferences.extraConfirmations,
    tourCompleted: preferences.tourCompleted,
    displayName: preferences.displayName,
    notifications: { ...preferences.notifications },
  };
}
