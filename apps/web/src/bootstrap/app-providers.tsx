"use client";

import { useMemo, type ReactNode } from "react";
import { AppShell, createAppStores } from "@senior-ease/features";
import { WebStorage } from "./web-storage";

/**
 * Composition root da Web: injeta o adaptador de armazenamento local e monta o
 * AppShell (stores + i18n + tema). Criado uma unica vez por carga da aplicacao.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const stores = useMemo(() => createAppStores(new WebStorage()), []);
  return <AppShell stores={stores}>{children}</AppShell>;
}
