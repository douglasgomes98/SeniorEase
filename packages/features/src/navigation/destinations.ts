import type { AppRoute, DestinationDescriptor } from "@senior-ease/core";
import type { MessageKey } from "@senior-ease/i18n";

/**
 * Entrada do catalogo de destinos: a rota e sua marca de avancado (dominio)
 * mais as chaves de traducao do rotulo e da descricao (apresentacao). As chaves
 * ficam aqui, fora do core - o core so conhece rotas abstratas.
 */
export interface DestinationCatalogEntry extends DestinationDescriptor {
  labelKey: MessageKey;
  descriptionKey: MessageKey;
}

/**
 * Catalogo ordenado de destinos do hub. A ordem e a fonte unica que garante os
 * mesmos destinos, na mesma ordem, em Web e Mobile. Os tres primeiros sao
 * primarios; o Historico e avancado (visivel no modo padrao, escondido no modo
 * simples, que fica com os tres essenciais).
 */
export const DESTINATIONS: DestinationCatalogEntry[] = [
  {
    route: "activities",
    advanced: false,
    labelKey: "nav.destination.activities.label",
    descriptionKey: "nav.destination.activities.description",
  },
  {
    route: "personalization",
    advanced: false,
    labelKey: "nav.destination.personalization.label",
    descriptionKey: "nav.destination.personalization.description",
  },
  {
    route: "profile",
    advanced: false,
    labelKey: "nav.destination.profile.label",
    descriptionKey: "nav.destination.profile.description",
  },
  {
    route: "history",
    advanced: true,
    labelKey: "nav.destination.history.label",
    descriptionKey: "nav.destination.history.description",
  },
];

/** Chave do rotulo de uma rota (usada tambem pela afordancia de retomada). */
export function destinationLabelKey(route: AppRoute): MessageKey | null {
  return DESTINATIONS.find((entry) => entry.route === route)?.labelKey ?? null;
}
