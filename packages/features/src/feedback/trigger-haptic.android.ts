import * as Haptics from "expo-haptics";

/**
 * Reforco haptico de sucesso no Android (confirmacao multissensorial do feedback
 * reforcado). O Metro carrega este arquivo apenas neste alvo, entao a dependencia
 * nativa "expo-haptics" nunca entra no bundle Web. Falhas sao silenciosas - o
 * haptico reforca a confirmacao, nunca a bloqueia.
 */
export function triggerHaptic(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {
      /* haptico indisponivel: silencioso */
    },
  );
}
