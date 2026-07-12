import type { Activity } from "../../domain/activity";

/**
 * Fachada tipada de armazenamento de atividades (Inversao de Dependencia - D do
 * SOLID), consumida pela feature de lista. A camada de aplicacao depende desta
 * abstracao, nunca de localStorage ou AsyncStorage. A implementacao vive no core
 * (createActivitiesStorage), sobre o repositorio de envelope, e concentra a
 * validacao de fronteira num unico lugar.
 */
export interface ActivitiesStoragePort {
  /** Le e valida; registros invalidos sao ignorados; lista vazia quando ausente. */
  load(): Promise<Activity[]>;
  /** Persiste; rejeita quando a gravacao falha, para a store observar. */
  save(activities: Activity[]): Promise<void>;
}
