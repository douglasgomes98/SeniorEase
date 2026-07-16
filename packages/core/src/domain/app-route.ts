import type { NavigationMode } from "./navigation-mode";

/**
 * Value object: rota da aplicacao. "home" e o hub central (nao aparece como
 * destino navegavel); as demais sao os modulos hospedados pelo shell.
 */
export const APP_ROUTES = [
  "home",
  "activities",
  "personalization",
  "profile",
  "history",
] as const;

export type AppRoute = (typeof APP_ROUTES)[number];

export const APP_ROUTE_DEFAULT: AppRoute = "home";

export function isAppRoute(value: unknown): value is AppRoute {
  return (
    typeof value === "string" && (APP_ROUTES as readonly string[]).includes(value)
  );
}

/**
 * Descritor de destino do hub. "home" nunca e um destino (e o proprio hub).
 * `advanced` marca destinos escondidos no modo simples.
 */
export interface DestinationDescriptor {
  route: AppRoute;
  advanced: boolean;
}

/**
 * No modo simples a Home expoe no maximo 4 destinos primarios (WCAG/carga
 * cognitiva); no modo padrao expoe o conjunto completo.
 */
export const MAX_SIMPLE_DESTINATIONS = 4;

/**
 * Regra pura de visibilidade dos destinos. No modo simples esconde os
 * avancados e limita o conjunto primario a {@link MAX_SIMPLE_DESTINATIONS},
 * preservando a ordem do catalogo; no modo padrao devolve todos na mesma ordem.
 * A ordem estavel garante paridade Web + Mobile.
 */
export function visibleRoutes(
  mode: NavigationMode,
  catalog: readonly DestinationDescriptor[],
): AppRoute[] {
  if (mode === "standard") {
    return catalog.map((entry) => entry.route);
  }
  return catalog
    .filter((entry) => !entry.advanced)
    .slice(0, MAX_SIMPLE_DESTINATIONS)
    .map((entry) => entry.route);
}
