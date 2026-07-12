import { DEFAULT_LOCALE, type Locale } from "@senior-ease/i18n";
import { FONT_SCALE_DEFAULT } from "./font-scale";
import { CONTRAST_LEVEL_DEFAULT, type ContrastLevel } from "./contrast-level";
import { NAVIGATION_MODE_DEFAULT, type NavigationMode } from "./navigation-mode";
import { SPACING_SCALE_DEFAULT, type SpacingScale } from "./spacing-scale";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "./notification-preferences";

/** Limite do nome de exibicao opcional mostrado na saudacao do perfil. */
export const DISPLAY_NAME_MAX_LENGTH = 40;

/**
 * Entidade de dominio: preferencias persistentes do usuario.
 * Concentra o Perfil + Configuracoes Persistentes exigido nos requisitos.
 */
export interface Preferences {
  locale: Locale;
  fontScale: number;
  contrastLevel: ContrastLevel;
  spacingScale: SpacingScale;
  navigationMode: NavigationMode;
  reinforcedFeedback: boolean;
  extraConfirmations: boolean;
  tourCompleted: boolean;
  displayName: string;
  notifications: NotificationPreferences;
}

export const DEFAULT_PREFERENCES: Preferences = {
  locale: DEFAULT_LOCALE,
  fontScale: FONT_SCALE_DEFAULT,
  contrastLevel: CONTRAST_LEVEL_DEFAULT,
  spacingScale: SPACING_SCALE_DEFAULT,
  navigationMode: NAVIGATION_MODE_DEFAULT,
  reinforcedFeedback: false,
  extraConfirmations: true,
  tourCompleted: false,
  displayName: "",
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
};

/**
 * Normaliza o nome de exibicao: remove espacos nas pontas e limita ao tamanho
 * maximo. A regra vive no dominio, nunca na UI. Vazio e permitido.
 */
export function normalizeDisplayName(name: string): string {
  return name.trim().slice(0, DISPLAY_NAME_MAX_LENGTH);
}
