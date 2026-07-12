import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { FeedbackMessage, FeedbackTone } from "../domain/feedback";

/**
 * Estado da store de feedback: um unico slot de mensagem (o mais recente vence).
 * Store efemera e injetavel, espelhando preferences/tour/navigation. Sem timers
 * nem plataforma: quem cuida de duracao, haptico e animacao e o FeedbackHost.
 */
export interface FeedbackState {
  /** Slot unico; nulo quando nao ha confirmacao ativa. */
  current: FeedbackMessage | null;
  /** Publica uma confirmacao; tom padrao "success". Substitui a atual. */
  announce: (text: string, tone?: FeedbackTone) => void;
  /** Limpa a mensagem; com id, apenas se coincidir com a atual. */
  dismiss: (id?: number) => void;
}

export type FeedbackStore = UseBoundStore<StoreApi<FeedbackState>>;

/**
 * Fabrica da store de feedback. Um contador monotonico interno gera ids
 * deterministicos (amigaveis a teste) para dispensa direcionada. "announce"
 * sempre substitui a mensagem atual (mais recente vence, sem fila).
 */
export function createFeedbackStore(): FeedbackStore {
  let nextId = 0;
  return create<FeedbackState>((set, get) => ({
    current: null,
    announce: (text, tone = "success"): void => {
      nextId += 1;
      set({ current: { id: nextId, text, tone } });
    },
    dismiss: (id): void => {
      if (id !== undefined && get().current?.id !== id) {
        return;
      }
      set({ current: null });
    },
  }));
}
