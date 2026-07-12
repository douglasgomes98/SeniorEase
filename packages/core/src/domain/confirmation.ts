/**
 * Value object da confirmacao e a regra pura do portao (gate).
 *
 * Este e o mecanismo compartilhado por onde toda acao destrutiva ou
 * irreversivel passa antes de rodar. Aqui vivem apenas o formato da requisicao
 * e a regra que decide se um dialogo deve aparecer - nenhuma preocupacao de
 * store, plataforma ou apresentacao (essas moram no host e no dialogo). O tom
 * mapeia, na UI, para os papeis de cor do design system (danger).
 */

/**
 * Tom da confirmacao:
 * - "danger": acao destrutiva/irreversivel (papel de cor danger) - padrao.
 * - "default": confirmacao neutra que um consumidor pode querer exibir.
 */
export type ConfirmationTone = "danger" | "default";

/**
 * Requisicao de confirmacao efemera (nunca persistida). Toda a copy ja vem
 * traduzida pelo container; os componentes so renderizam texto, sem markup.
 */
export interface ConfirmationRequest {
  /** Titulo ja traduzido. */
  title: string;
  /** Texto em linguagem simples; nomeia exatamente o que vai acontecer. */
  message: string;
  /** Rotulo ja traduzido do botao de confirmar. */
  confirmLabel: string;
  /** Rotulo ja traduzido do botao de cancelar (padrao seguro). */
  cancelLabel: string;
  /** Seleciona o estilo do confirmar; padrao "danger". */
  tone?: ConfirmationTone;
}

/**
 * Regra pura do portao: mostra um dialogo apenas quando as confirmacoes extras
 * estao ligadas. Com elas desligadas, a acao segue direto (escolha explicita do
 * usuario). O sinalizador vem, em runtime, das preferencias persistidas.
 */
export function shouldConfirm(extraConfirmations: boolean): boolean {
  return extraConfirmations;
}
