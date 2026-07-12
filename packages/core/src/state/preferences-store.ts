import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { Locale } from "@senior-ease/i18n";
import {
  DEFAULT_PREFERENCES,
  normalizeDisplayName,
  type Preferences,
} from "../domain/preferences";
import { decreaseFontScale, increaseFontScale } from "../domain/font-scale";
import { toggleContrastLevel } from "../domain/contrast-level";
import { normalizeSpacingScale, type SpacingScale } from "../domain/spacing-scale";
import type { NavigationMode } from "../domain/navigation-mode";
import type { NotificationPreferences } from "../domain/notification-preferences";
import type { LoadPreferences } from "../application/use-cases/load-preferences";
import type { SavePreferences } from "../application/use-cases/save-preferences";

export interface PreferencesState extends Preferences {
  isHydrated: boolean;
  /** Verdadeiro apos uma gravacao falhar; limpo na proxima gravacao bem-sucedida. */
  persistenceError: boolean;
  hydrate: () => Promise<void>;
  // aparencia e interacao
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  toggleContrast: () => void;
  setSpacingScale: (scale: SpacingScale) => void;
  setNavigationMode: (mode: NavigationMode) => void;
  setReinforcedFeedback: (enabled: boolean) => void;
  setExtraConfirmations: (enabled: boolean) => void;
  setLocale: (locale: Locale) => void;
  setTourCompleted: (value: boolean) => void;
  // perfil e notificacoes
  setDisplayName: (name: string) => void;
  setNotifications: (patch: Partial<NotificationPreferences>) => void;
  resetToDefaults: () => void;
}

export interface PreferencesStoreDeps {
  loadPreferences: LoadPreferences;
  savePreferences: SavePreferences;
}

export type PreferencesStore = UseBoundStore<StoreApi<PreferencesState>>;

function selectPreferences(state: PreferencesState): Preferences {
  return {
    locale: state.locale,
    fontScale: state.fontScale,
    contrastLevel: state.contrastLevel,
    spacingScale: state.spacingScale,
    navigationMode: state.navigationMode,
    reinforcedFeedback: state.reinforcedFeedback,
    extraConfirmations: state.extraConfirmations,
    tourCompleted: state.tourCompleted,
    displayName: state.displayName,
    notifications: state.notifications,
  };
}

/**
 * Fabrica da store de preferencias. Recebe os casos de uso por injecao
 * (composition root no app). A store e um adaptador de interface: aplica as
 * funcoes puras do dominio e delega a persistencia aos casos de uso.
 */
export function createPreferencesStore(
  deps: PreferencesStoreDeps,
): PreferencesStore {
  return create<PreferencesState>((set, get) => {
    /**
     * Persiste o estado atual. A mudanca ja esta em memoria; se a gravacao
     * falhar, mantemos o valor e marcamos persistenceError para a UI mostrar um
     * aviso gentil. Uma gravacao bem-sucedida limpa a marca.
     */
    const persist = (): void => {
      void deps.savePreferences
        .execute(selectPreferences(get()))
        .then(() => {
          if (get().persistenceError) {
            set({ persistenceError: false });
          }
        })
        .catch(() => {
          set({ persistenceError: true });
        });
    };

    return {
      ...DEFAULT_PREFERENCES,
      isHydrated: false,
      persistenceError: false,
      hydrate: async (): Promise<void> => {
        const preferences = await deps.loadPreferences.execute();
        set({ ...preferences, isHydrated: true });
      },
      increaseFontScale: (): void => {
        set({ fontScale: increaseFontScale(get().fontScale) });
        persist();
      },
      decreaseFontScale: (): void => {
        set({ fontScale: decreaseFontScale(get().fontScale) });
        persist();
      },
      toggleContrast: (): void => {
        set({ contrastLevel: toggleContrastLevel(get().contrastLevel) });
        persist();
      },
      setSpacingScale: (scale: SpacingScale): void => {
        set({ spacingScale: normalizeSpacingScale(scale) });
        persist();
      },
      setNavigationMode: (mode: NavigationMode): void => {
        set({ navigationMode: mode });
        persist();
      },
      setReinforcedFeedback: (enabled: boolean): void => {
        set({ reinforcedFeedback: enabled });
        persist();
      },
      setExtraConfirmations: (enabled: boolean): void => {
        set({ extraConfirmations: enabled });
        persist();
      },
      setLocale: (locale: Locale): void => {
        set({ locale });
        persist();
      },
      setTourCompleted: (value: boolean): void => {
        set({ tourCompleted: value });
        persist();
      },
      setDisplayName: (name: string): void => {
        set({ displayName: normalizeDisplayName(name) });
        persist();
      },
      setNotifications: (patch: Partial<NotificationPreferences>): void => {
        set({ notifications: { ...get().notifications, ...patch } });
        persist();
      },
      resetToDefaults: (): void => {
        set({
          ...DEFAULT_PREFERENCES,
          notifications: { ...DEFAULT_PREFERENCES.notifications },
        });
        persist();
      },
    };
  });
}
