import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StoragePort } from "@senior-ease/core";

/**
 * Adaptador de armazenamento bruto do Mobile (AsyncStorage). Implementa apenas
 * a porta generica; a validacao tipada fica no core. Uma gravacao que falha
 * propaga o erro para o core observar e avisar o usuario.
 */
export class NativeStorage implements StoragePort {
  getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  setItem(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  }

  removeItem(key: string): Promise<void> {
    return AsyncStorage.removeItem(key);
  }
}
