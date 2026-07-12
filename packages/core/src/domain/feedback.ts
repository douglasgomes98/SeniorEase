/**
 * Value object do feedback de acao e a regra pura de duracao.
 *
 * O mecanismo de feedback confirma cada acao que muda estado com uma mensagem
 * positiva, exibida em um unico lugar e anunciada a tecnologia assistiva. Aqui
 * vivem apenas o formato da mensagem e a regra de tempo - nenhuma preocupacao
 * de timer, plataforma ou apresentacao (essas moram no host). O tom mapeia, na
 * UI, para os papeis de cor do design system.
 */

/**
 * Tom da confirmacao:
 * - "success": conclusao positiva (papel de cor success) - padrao.
 * - "info": aviso neutro.
 * - "danger": contexto destrutivo/negativo (papel de cor danger).
 */
export type FeedbackTone = "success" | "info" | "danger";

/** Mensagem de feedback efemera (nunca persistida). */
export interface FeedbackMessage {
  /** Contador monotonico; identifica a mensagem para dispensa direcionada. */
  id: number;
  /** Texto ja traduzido, resolvido pelo chamador; renderizado so como texto. */
  text: string;
  tone: FeedbackTone;
}

/** Confirmacao padrao: visivel por 3 segundos. */
export const STANDARD_FEEDBACK_MS = 3000;

/** Confirmacao reforcada: visivel por 5 segundos (maior + glifo + haptico). */
export const REINFORCED_FEEDBACK_MS = 5000;

/**
 * Regra pura de duracao: 3 s no modo padrao, 5 s com feedback reforcado.
 * O sinalizador reforcado vem, em runtime, das preferencias persistidas.
 */
export function feedbackDurationMs(reinforced: boolean): number {
  return reinforced ? REINFORCED_FEEDBACK_MS : STANDARD_FEEDBACK_MS;
}
