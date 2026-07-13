/**
 * Fonte de id unica e cross-platform para atividades. Combina o instante atual
 * em base-36 com um contador monotonico de sessao, garantindo unicidade mesmo
 * dentro do mesmo milissegundo. Nao usa `crypto.randomUUID` (ausente no Hermes)
 * nem dependencia nova: funciona igual na Web e no React Native. Nao e pura por
 * design (le o relogio e avanca o contador) - por isso as operacoes de dominio
 * recebem o id ja pronto por argumento e permanecem testaveis.
 */
let counter = 0;

export function nextActivityId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}
