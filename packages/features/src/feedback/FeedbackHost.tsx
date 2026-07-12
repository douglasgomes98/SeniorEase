import { useEffect } from "react";
import {
  feedbackDurationMs,
  useFeedback,
  usePreferences,
} from "@senior-ease/core";
import { FeedbackBanner } from "@senior-ease/ui";
import { triggerHaptic } from "./trigger-haptic";

/**
 * Host global do feedback: montado uma vez no shell, acima de todas as telas.
 * Le a mensagem atual e a preferencia de feedback reforcado (F03), resolve a
 * duracao (3 s / 5 s) e dispara o auto-dismiss no tempo certo; no modo reforcado
 * dispara tambem o haptico de sucesso (Android). Renderiza o unico banner e nao
 * devolve nada quando nao ha mensagem, sem interceptar toques enquanto ocioso.
 */
export function FeedbackHost() {
  const current = useFeedback((state) => state.current);
  const dismiss = useFeedback((state) => state.dismiss);
  const reinforced = usePreferences((state) => state.reinforcedFeedback);

  const messageId = current?.id ?? null;

  useEffect(() => {
    if (messageId === null) {
      return;
    }
    if (reinforced) {
      triggerHaptic();
    }
    const timer = setTimeout(() => {
      dismiss(messageId);
    }, feedbackDurationMs(reinforced));
    return () => clearTimeout(timer);
  }, [messageId, reinforced, dismiss]);

  if (!current) {
    return null;
  }

  return (
    <FeedbackBanner
      text={current.text}
      tone={current.tone}
      reinforced={reinforced}
    />
  );
}
