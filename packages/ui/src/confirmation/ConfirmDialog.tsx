import { useEffect, useRef } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { Button } from "../components/Button";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";

/**
 * Tom do dialogo. Igual, por estrutura, ao tom do dominio - a UI e puramente
 * apresentacional e nao depende do core. "danger" pinta o confirmar com o papel
 * de cor de perigo; "default" usa o papel de acao primaria.
 */
export type ConfirmationTone = "danger" | "default";

export interface ConfirmDialogProps {
  visible: boolean;
  /** Titulo ja traduzido; renderizado apenas como texto. */
  title: string;
  /** Mensagem ja traduzida; nomeia exatamente o que vai acontecer. */
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: ConfirmationTone;
  onConfirm: () => void;
  /** Disparado tambem por toque no fundo, Escape (Web) e voltar (Android). */
  onCancel: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
const CANCEL_TEST_ID = "confirm-dialog-cancel";

/**
 * Dialogo de confirmacao bloqueante e acessivel: um unico lugar por onde as
 * acoes destrutivas pedem uma decisao explicita. Construido sobre o Modal
 * transparente do React Native (voltar do Android -> cancelar via
 * onRequestClose), marcado como dialogo modal para a tecnologia assistiva. O
 * foco vai para o controle seguro (cancelar) ao abrir e volta ao elemento
 * anterior ao fechar; na Web o Tab fica preso no dialogo e o Escape cancela. As
 * cores vem so dos papeis do design system - nunca hex - entao AA/AAA valem nas
 * duas paletas. A animacao de entrada e suprimida sob reducao de movimento.
 * Componente puro, dirigido por props.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors, space, radii, shadow } = useTheme();
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<View>(null);

  // Handler mais recente sem re-disparar o efeito de foco: o efeito depende so
  // de "visible", entao captura o elemento realmente ativo antes de abrir.
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  // Gestao de foco so na Web, onde o Modal do RN nao entrega trap/restore.
  useEffect(() => {
    if (Platform.OS !== "web" || !visible) {
      return;
    }
    if (typeof document === "undefined") {
      return;
    }
    const dialogNode = dialogRef.current as unknown as HTMLElement | null;
    if (!dialogNode) {
      return;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = (): HTMLElement[] =>
      Array.from(
        dialogNode.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);

    const focusTimer = window.setTimeout(() => {
      const cancelNode = dialogNode.querySelector<HTMLElement>(
        `[data-testid="${CANCEL_TEST_ID}"]`,
      );
      (cancelNode ?? getFocusable()[0])?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancelRef.current();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const focusable = getFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (active === first || !dialogNode.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !dialogNode.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? "none" : "fade"}
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <View style={{ flex: 1 }}>
        <Pressable
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          focusable={false}
          onPress={onCancel}
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: colors.overlay },
          ]}
        />
        <View
          pointerEvents="box-none"
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: space.lg,
          }}
        >
          <View
            ref={dialogRef}
            role="dialog"
            aria-modal
            aria-label={title}
            accessibilityViewIsModal
            onStartShouldSetResponder={() => true}
            style={{
              width: "100%",
              maxWidth: 520,
              backgroundColor: colors.surface,
              borderColor: colors.line,
              borderWidth: 2,
              borderRadius: radii.lg,
              padding: space.lg,
              gap: space.lg,
              ...shadow.native,
            }}
          >
            <Stack gap="sm">
              <Text variant="title" accessibilityRole="header">
                {title}
              </Text>
              <Text variant="body">{message}</Text>
            </Stack>

            <Stack direction="row" gap="sm">
              <Button
                label={cancelLabel}
                variant="secondary"
                onPress={onCancel}
                testID={CANCEL_TEST_ID}
                style={{ flexGrow: 1, flexBasis: 0 }}
              />
              <Button
                label={confirmLabel}
                variant={tone === "danger" ? "danger" : "primary"}
                onPress={onConfirm}
                testID="confirm-dialog-confirm"
                style={{ flexGrow: 1, flexBasis: 0 }}
              />
            </Stack>
          </View>
        </View>
      </View>
    </Modal>
  );
}
