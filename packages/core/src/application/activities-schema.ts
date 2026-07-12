import {
  ACTIVITIES_MAX,
  clampActivityDescription,
  clampActivityTitle,
  normalizeActivitySteps,
  normalizeActivityStatus,
  type Activity,
} from "../domain/activity";

/**
 * Validacao de fronteira da colecao de atividades - a leitura validada que a
 * persistencia fornece a feature de lista. Um registro so e mantido quando e um
 * objeto com id e titulo string; caso contrario e ignorado, sem derrubar a
 * lista. Os registros mantidos tem os campos coagidos/limitados e a colecao e
 * limitada aos primeiros ACTIVITIES_MAX validos.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEpochMs(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Coage um registro desconhecido; retorna null quando deve ser ignorado. */
function parseActivity(raw: unknown): Activity | null {
  if (!isPlainObject(raw)) {
    return null;
  }
  if (typeof raw.id !== "string" || typeof raw.title !== "string") {
    return null;
  }
  return {
    id: raw.id,
    title: clampActivityTitle(raw.title),
    description:
      typeof raw.description === "string"
        ? clampActivityDescription(raw.description)
        : "",
    steps: normalizeActivitySteps(raw.steps),
    due: typeof raw.due === "string" ? raw.due : "",
    status: normalizeActivityStatus(raw.status),
    createdAt: isEpochMs(raw.createdAt) ? raw.createdAt : Date.now(),
    completedAt: isEpochMs(raw.completedAt) ? raw.completedAt : null,
  };
}

/**
 * Le a colecao: ignora os registros invalidos, mantem e limita os validos e
 * corta em ACTIVITIES_MAX. Uma entrada que nao seja array vira lista vazia.
 */
export function parseActivities(raw: unknown): Activity[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const activities: Activity[] = [];
  for (const item of raw) {
    if (activities.length >= ACTIVITIES_MAX) {
      break;
    }
    const activity = parseActivity(item);
    if (activity) {
      activities.push(activity);
    }
  }
  return activities;
}

/** Projeta a colecao para a forma persistida (limitada e com passos copiados). */
export function toPersistedActivities(activities: Activity[]): Activity[] {
  return activities.slice(0, ACTIVITIES_MAX).map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    steps: [...activity.steps],
    due: activity.due,
    status: activity.status,
    createdAt: activity.createdAt,
    completedAt: activity.completedAt,
  }));
}
