import { z } from "zod";
import { LOCALES } from "@senior-ease/i18n";
import { CONTRAST_LEVELS } from "../domain/contrast-level";
import { NAVIGATION_MODES } from "../domain/navigation-mode";
import { FONT_SCALE_MAX, FONT_SCALE_MIN } from "../domain/font-scale";
import { isSpacingScale, type SpacingScale } from "../domain/spacing-scale";
import {
  isNotificationLeadTime,
  NOTIFICATION_CHANNELS,
  type NotificationLeadTime,
} from "../domain/notification-preferences";
import {
  DEFAULT_PREFERENCES,
  DISPLAY_NAME_MAX_LENGTH,
  type Preferences,
} from "../domain/preferences";

/**
 * Validacao de fronteira: todo dado vindo do armazenamento e tratado como nao
 * confiavel e validado antes de entrar no dominio. A versao do schema permite
 * evoluir o formato guardado com seguranca - uma migracao para frente preserva
 * os valores existentes e preenche os campos novos com padroes seguros.
 */
export const PREFERENCES_SCHEMA_VERSION = 2;

const spacingScaleSchema = z.custom<SpacingScale>((value) =>
  isSpacingScale(value),
);

const leadTimeSchema = z.custom<NotificationLeadTime>((value) =>
  isNotificationLeadTime(value),
);

const quietHoursTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

const notificationsSchema = z.object({
  enabled: z.boolean(),
  leadTimeMinutes: leadTimeSchema,
  channel: z.enum(NOTIFICATION_CHANNELS),
  quietHours: z
    .object({ start: quietHoursTimeSchema, end: quietHoursTimeSchema })
    .nullable(),
});

/** Schema legado (v1) - reconhecido apenas para migrar dados existentes. */
const preferencesV1Schema = z.object({
  schemaVersion: z.literal(1),
  locale: z.enum(LOCALES),
  fontScale: z.number().min(FONT_SCALE_MIN).max(FONT_SCALE_MAX),
  contrastLevel: z.enum(CONTRAST_LEVELS),
  navigationMode: z.enum(NAVIGATION_MODES),
  extraConfirmations: z.boolean(),
  tourCompleted: z.boolean(),
});

/** Schema atual (v2). */
export const persistedPreferencesSchema = z.object({
  schemaVersion: z.literal(PREFERENCES_SCHEMA_VERSION),
  locale: z.enum(LOCALES),
  fontScale: z.number().min(FONT_SCALE_MIN).max(FONT_SCALE_MAX),
  contrastLevel: z.enum(CONTRAST_LEVELS),
  spacingScale: spacingScaleSchema,
  navigationMode: z.enum(NAVIGATION_MODES),
  reinforcedFeedback: z.boolean(),
  extraConfirmations: z.boolean(),
  tourCompleted: z.boolean(),
  displayName: z.string().max(DISPLAY_NAME_MAX_LENGTH),
  notifications: notificationsSchema,
});

export type PersistedPreferences = z.infer<typeof persistedPreferencesSchema>;
type PersistedPreferencesV1 = z.infer<typeof preferencesV1Schema>;

export function toPersisted(preferences: Preferences): PersistedPreferences {
  return {
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
    locale: preferences.locale,
    fontScale: preferences.fontScale,
    contrastLevel: preferences.contrastLevel,
    spacingScale: preferences.spacingScale,
    navigationMode: preferences.navigationMode,
    reinforcedFeedback: preferences.reinforcedFeedback,
    extraConfirmations: preferences.extraConfirmations,
    tourCompleted: preferences.tourCompleted,
    displayName: preferences.displayName,
    notifications: preferences.notifications,
  };
}

/**
 * Migracao forward v1 -> v2: mantem todos os valores validos do registro legado
 * e preenche os campos novos com os padroes seguros. O resultado e persistido no
 * formato v2 na proxima gravacao, atualizando instalacoes existentes no lugar.
 */
function migrateV1toV2(v1: PersistedPreferencesV1): PersistedPreferences {
  return {
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
    locale: v1.locale,
    fontScale: v1.fontScale,
    contrastLevel: v1.contrastLevel,
    navigationMode: v1.navigationMode,
    extraConfirmations: v1.extraConfirmations,
    tourCompleted: v1.tourCompleted,
    spacingScale: DEFAULT_PREFERENCES.spacingScale,
    reinforcedFeedback: DEFAULT_PREFERENCES.reinforcedFeedback,
    displayName: DEFAULT_PREFERENCES.displayName,
    notifications: { ...DEFAULT_PREFERENCES.notifications },
  };
}

/**
 * Converte um payload desconhecido (JSON do storage) em Preferences validas.
 * Fluxo: valida contra o schema atual; se falhar, tenta o schema legado e migra;
 * caso contrario retorna null. Versoes acima da suportada e dados corrompidos
 * caem para null, permitindo usar os padroes sem quebrar a aplicacao (fail-safe).
 */
export function parsePreferences(raw: unknown): Preferences | null {
  const current = persistedPreferencesSchema.safeParse(raw);
  if (current.success) {
    return fromPersisted(current.data);
  }

  const legacy = preferencesV1Schema.safeParse(raw);
  if (legacy.success) {
    return fromPersisted(migrateV1toV2(legacy.data));
  }

  return null;
}

function fromPersisted(persisted: PersistedPreferences): Preferences {
  const { schemaVersion: _schemaVersion, ...preferences } = persisted;
  return { ...DEFAULT_PREFERENCES, ...preferences };
}
