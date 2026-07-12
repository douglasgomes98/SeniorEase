import { useConfirmation } from "@senior-ease/core";
import { ConfirmDialog } from "@senior-ease/ui";

/**
 * Host global de confirmacao: montado uma vez no shell, acima de todas as telas.
 * Le a requisicao pendente e as acoes de confirmar/cancelar e renderiza o unico
 * dialogo a partir da copy ja traduzida. Nao devolve nada quando esta ocioso,
 * sem interceptar toques enquanto nao ha nada a confirmar.
 */
export function ConfirmationHost() {
  const current = useConfirmation((state) => state.current);
  const confirm = useConfirmation((state) => state.confirm);
  const cancel = useConfirmation((state) => state.cancel);

  if (!current) {
    return null;
  }

  const { request } = current;
  return (
    <ConfirmDialog
      visible
      title={request.title}
      message={request.message}
      confirmLabel={request.confirmLabel}
      cancelLabel={request.cancelLabel}
      tone={request.tone ?? "danger"}
      onConfirm={confirm}
      onCancel={cancel}
    />
  );
}
