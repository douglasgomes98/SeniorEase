import type { StoragePort } from "@senior-ease/core";

/**
 * Adaptador de armazenamento bruto da Web (localStorage). Implementa apenas a
 * porta generica; a validacao tipada fica no core. Guarda de renderizacao no
 * servidor: sem window, a leitura devolve nulo e a gravacao nao faz nada. Uma
 * gravacao que falha (cota, modo privado) propaga o erro para o core observar.
 */
export class WebStorage implements StoragePort {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.removeItem(key);
  }
}
