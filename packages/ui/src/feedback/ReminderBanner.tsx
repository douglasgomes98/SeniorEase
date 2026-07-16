import { useEffect, useRef } from "react";
import { Animated, Platform, View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { Button } from "../components/Button";
import { Text } from "../components/Text";

/**
 * Tom do lembrete. Reusa os papeis do design system: info (accent) para o que
 * esta chegando, warning/danger (familia danger, suave) para atrasos e avisos de
 * permissao. Como nao ha papel dedicado de "warning", warning e danger dividem a
 * mesma base suave, o que mantem o banner gentil.
 */
export type ReminderBannerTone = "info" | "warning" | "danger";

export interface ReminderBannerAction {
  label: string;
  onPress: () => void;
}

export interface ReminderBannerProps {
  /** Ja traduzido. */
  title: string;
  /** Resumo ja traduzido ou o aviso de permissao; renderizado como texto puro. */
  message: string;
  tone: ReminderBannerTone;
  /** Acao opcional, ex.: "Ver atividades" (alvo de toque >= 48dp). */
  action?: ReminderBannerAction;
  testID?: string;
}

/**
 * Banner gentil de lembretes (F12), reusado na Home e nas Atividades. E uma live
 * region "polite" com role "status", entao a tecnologia assistiva o anuncia ao
 * abrir o app. Cores apenas dos papeis do design system (F01) - nunca hex. A
 * entrada faz um fade suave, suprimido sob reducao de movimento (mesmo padrao do
 * FeedbackBanner). Puro e dirigido por props: toda a copia chega traduzida, sem
 * regra de negocio nem i18n aqui dentro.
 */
export function ReminderBanner({
  title,
  message,
  tone,
  action,
  testID,
}: ReminderBannerProps) {
  const { colors, space, radii, shadow } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    opacity.setValue(0);
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: Platform.OS !== "web",
    });
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion, title, message]);

  const TONES: Record<ReminderBannerTone, { bg: string; border: string }> = {
    info: { bg: colors.accentSoft, border: colors.accent },
    warning: { bg: colors.dangerSoft, border: colors.danger },
    danger: { bg: colors.dangerSoft, border: colors.danger },
  };
  const { bg, border } = TONES[tone];

  return (
    <Animated.View style={{ opacity }}>
      <View
        accessibilityLiveRegion="polite"
        role="status"
        testID={testID}
        style={{
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 2,
          borderRadius: radii.lg,
          padding: space.lg,
          gap: space.sm,
          ...shadow.native,
        }}
      >
        <Text variant="title">{title}</Text>
        <Text variant="body">{message}</Text>
        {action ? (
          <Button
            label={action.label}
            variant="primary"
            onPress={action.onPress}
            testID={testID ? `${testID}-action` : undefined}
          />
        ) : null}
      </View>
    </Animated.View>
  );
}
