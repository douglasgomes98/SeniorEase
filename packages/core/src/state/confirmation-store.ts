import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { ConfirmationRequest } from "../domain/confirmation";

/**
 * Requisicao pendente: a copy mais um id monotonico que a identifica. O
 * resolver da promessa e capturado internamente pela store (nunca exposto no
 * estado), entao o slot permanece serializavel e livre de plataforma.
 */
export interface PendingConfirmation {
  id: number;
  request: ConfirmationRequest;
}

/**
 * Estado da store de confirmacao: um unico slot pendente (o mais recente vence).
 * Store efemera e injetavel, espelhando feedback/preferences/tour. Sem timers,
 * plataforma ou leitura de preferencias: o portao (useConfirm) aplica a regra e
 * o ConfirmationHost renderiza o dialogo.
 */
export interface ConfirmationState {
  /** Slot unico; nulo quando nao ha confirmacao ativa. */
  current: PendingConfirmation | null;
  /**
   * Abre o dialogo e devolve uma promessa que resolve no confirmar/cancelar.
   * Uma nova requisicao supera a pendente, resolvendo a anterior como false
   * (cancelada) - o mais recente vence, nunca empilha dialogos.
   */
  request: (req: ConfirmationRequest) => Promise<boolean>;
  /** Resolve a pendente como true e limpa o slot. */
  confirm: () => void;
  /** Resolve a pendente como false e limpa o slot. */
  cancel: () => void;
}

export type ConfirmationStore = UseBoundStore<StoreApi<ConfirmationState>>;

/**
 * Fabrica da store de confirmacao. Um contador monotonico interno gera ids
 * deterministicos (amigaveis a teste). O resolver da promessa pendente vive num
 * fechamento; qualquer caminho de dispensa (cancel, backdrop, Esc, voltar, ou
 * uma requisicao que supera) resolve false, entao nenhuma acao destrutiva roda
 * sem um confirmar explicito.
 */
export function createConfirmationStore(): ConfirmationStore {
  let nextId = 0;
  let resolvePending: ((value: boolean) => void) | null = null;

  return create<ConfirmationState>((set) => {
    const settle = (value: boolean): void => {
      if (!resolvePending) {
        return;
      }
      const resolve = resolvePending;
      resolvePending = null;
      set({ current: null });
      resolve(value);
    };

    return {
      current: null,
      request: (req: ConfirmationRequest): Promise<boolean> => {
        if (resolvePending) {
          const previous = resolvePending;
          resolvePending = null;
          previous(false);
        }
        nextId += 1;
        const id = nextId;
        return new Promise<boolean>((resolve) => {
          resolvePending = resolve;
          set({ current: { id, request: req } });
        });
      },
      confirm: (): void => settle(true),
      cancel: (): void => settle(false),
    };
  });
}
