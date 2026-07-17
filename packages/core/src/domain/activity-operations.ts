import {
  ACTIVITIES_MAX,
  clampActivityDescription,
  clampActivityTitle,
  normalizeActivitySteps,
  type Activity,
} from "./activity";

/**
 * Operacoes puras de mutacao da lista de atividades. A entidade concentra a
 * forma e as invariantes; aqui vivem as transformacoes - criar, concluir,
 * excluir, adicionar respeitando o teto e ordenar. Sao puras: recebem o id e o
 * relogio (`now`) por argumento, entao nunca leem estado global e sao
 * totalmente testaveis no Vitest, como os value objects. A UI nunca as executa
 * diretamente - o container as chama e persiste o resultado via a store.
 */

/** Entrada de criacao vinda do formulario, antes de virar Activity. */
export interface ActivityDraft {
  /** Obrigatorio; limitado a ACTIVITY_TITLE_MAX_LENGTH. */
  title: string;
  /** Opcional; limitado a ACTIVITY_DESCRIPTION_MAX_LENGTH. */
  description: string;
  /** Opcional; normalizado (<=20 passos, cada um <=120). */
  steps: string[];
  /** Opcional; ISO 8601 ou "" quando nao ha vencimento. */
  due: string;
}

/** Verdadeiro quando o titulo e vazio apos remover espacos (gate de criacao). */
export function isBlankTitle(title: string): boolean {
  return title.trim().length === 0;
}

/**
 * Cria uma atividade a partir de um rascunho. Limita titulo/descricao e
 * normaliza os passos pelas invariantes do dominio; nasce pendente, com a
 * criacao carimbada e sem conclusao. O id e o `now` vem do container (injecao),
 * mantendo esta funcao pura.
 */
export function createActivity(
  draft: ActivityDraft,
  id: string,
  now: number,
): Activity {
  return {
    id,
    title: clampActivityTitle(draft.title),
    description: clampActivityDescription(draft.description),
    steps: normalizeActivitySteps(draft.steps),
    due: draft.due,
    status: "pending",
    createdAt: now,
    completedAt: null,
  };
}

/**
 * Conclui uma atividade, registrando o momento da conclusao. Idempotente: se ja
 * estiver concluida, devolve o registro intacto (nao re-carimba o horario).
 */
export function completeActivity(activity: Activity, now: number): Activity {
  if (activity.status === "completed") {
    return activity;
  }
  return { ...activity, status: "completed", completedAt: now };
}

/** Remove a atividade de id correspondente; preserva a ordem das demais. */
export function deleteActivity(list: Activity[], id: string): Activity[] {
  return list.filter((activity) => activity.id !== id);
}

/**
 * Adiciona uma atividade ao fim, respeitando o teto da colecao: no limite,
 * devolve a lista inalterada (a mudanca nao ocorre).
 */
export function addActivity(list: Activity[], activity: Activity): Activity[] {
  if (list.length >= ACTIVITIES_MAX) {
    return list;
  }
  return [...list, activity];
}

/** Chave de ordenacao por vencimento: sem vencimento (ou invalido) vai por ultimo. */
function dueOrder(activity: Activity): number {
  if (activity.due === "") {
    return Number.POSITIVE_INFINITY;
  }
  const parsed = Date.parse(activity.due);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

/**
 * Ordena a lista sem mutar a entrada: bloco pendente primeiro (vencimento mais
 * proximo no topo; sem vencimento depois, desempate por criacao mais antiga) e,
 * em seguida, o bloco concluido (conclusao mais recente primeiro).
 */
export function sortActivities(list: Activity[]): Activity[] {
  return [...list].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "pending" ? -1 : 1;
    }
    if (a.status === "pending") {
      const dueA = dueOrder(a);
      const dueB = dueOrder(b);
      if (dueA !== dueB) {
        return dueA - dueB;
      }
      return a.createdAt - b.createdAt;
    }
    return (b.completedAt ?? 0) - (a.completedAt ?? 0);
  });
}

/** Retencao do historico: guarda os 200 registros concluidos mais recentes. */
export const HISTORY_MAX = 200;

/**
 * Projecao de historico (leitura): somente atividades concluidas, ordenadas da
 * conclusao mais recente para a mais antiga e limitadas ao teto de retencao.
 * Deriva do proprio acervo de atividades - o historico nao e uma colecao a
 * parte. Pura e sem mutar a entrada: `filter` ja cria um novo array, entao o
 * `sort` seguinte nao toca na lista original.
 */
export function listHistory(list: Activity[], max: number = HISTORY_MAX): Activity[] {
  return list
    .filter((activity) => activity.status === "completed")
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
    .slice(0, max);
}

/**
 * Limpa o historico: remove todas as atividades concluidas e preserva as
 * pendentes na ordem original. O container persiste o resultado via a store
 * (mesmo idioma de excluir/persistir da lista), mantendo esta funcao pura.
 */
export function clearCompletedActivities(list: Activity[]): Activity[] {
  return list.filter((activity) => activity.status !== "completed");
}
