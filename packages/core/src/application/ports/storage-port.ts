/**
 * Porta generica de armazenamento chave/valor (baixo nivel). Cada plataforma
 * implementa esta unica primitiva; sobre ela o core constroi a validacao
 * tipada. `setItem` DEVE rejeitar quando a gravacao falha (cota, indisponivel),
 * para que quem chama consiga reagir e avisar o usuario.
 */
export interface StoragePort {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
