import { z } from "zod";
import { APP_ROUTES, APP_ROUTE_DEFAULT, type AppRoute } from "../domain/app-route";

/**
 * Validacao de fronteira do modulo persistido "ultimo visitado". Todo dado lido
 * do armazenamento e tratado como nao confiavel e validado antes do uso. A
 * versao no proprio conteudo permite rejeitar formatos desconhecidos com
 * seguranca (fail-safe: cai para "sem retomada").
 */
export const NAVIGATION_SCHEMA_VERSION = 1;

const persistedNavigationSchema = z.object({
  schemaVersion: z.literal(NAVIGATION_SCHEMA_VERSION),
  // "home" e o hub, nunca um alvo de retomada valido.
  lastRoute: z.enum(APP_ROUTES).refine((route) => route !== APP_ROUTE_DEFAULT),
});

export type PersistedNavigation = z.infer<typeof persistedNavigationSchema>;

/**
 * Converte um payload desconhecido (JSON do storage) na rota do ultimo modulo.
 * Versao invalida, "home" ou dado corrompido resolvem para null (sem retomada),
 * nunca lancam.
 */
export function parseNavigation(raw: unknown): AppRoute | null {
  const parsed = persistedNavigationSchema.safeParse(raw);
  return parsed.success ? parsed.data.lastRoute : null;
}

/** Serializa a rota do modulo no formato persistido versionado. */
export function toPersistedNavigation(route: AppRoute): PersistedNavigation {
  return { schemaVersion: NAVIGATION_SCHEMA_VERSION, lastRoute: route };
}
