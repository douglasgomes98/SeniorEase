import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { Locale } from "@senior-ease/i18n";
import {
  DEFAULT_PREFERENCES,
  type Preferences,
} from "../domain/preferences";
import {
  decreaseFontScale,
  increaseFontScale,
} from "../domain/font-scale";
import { toggleContrastLevel } from "../domain/contrast-level";
import type { LoadPreferences } from "../application/use-cases/load-preferences";
import type { SavePreferences } from "../application/use-cases/save-preferences";

export interface PreferencesState extends Preferences {
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  toggleContrast: () => void;
  setLocale: (locale: Locale) => void;
  setTourCompleted: (value: boolean) => void;
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
    const persist = (): void => {
      void deps.savePreferences.execute(selectPreferences(get()));
    };

    return {
      ...DEFAULT_PREFERENCES,
      isHydrated: false,
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
      setLocale: (locale: Locale): void => {
        set({ locale });
        persist();
      },
      setTourCompleted: (value: boolean): void => {
        set({ tourCompleted: value });
        persist();
      },
    };
  });
}
