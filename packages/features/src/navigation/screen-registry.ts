import type { ComponentType } from "react";
import type { AppRoute } from "@senior-ease/core";
import { HomeScreen } from "../home/HomeScreen";
import { ActivitiesScreen } from "../activities/ActivitiesScreen";
import { PersonalizationScreen } from "../personalization/PersonalizationScreen";
import { ProfileScreen } from "../profile/ProfileScreen";

export type ScreenRegistry = Record<AppRoute, ComponentType>;

/**
 * Registro rota -> tela. As telas reais dos modulos trocam a de cada chave
 * estavel depois, sem tocar no shell nem no navegador.
 */
export const screenRegistry: ScreenRegistry = {
  home: HomeScreen,
  activities: ActivitiesScreen,
  personalization: PersonalizationScreen,
  profile: ProfileScreen,
};
