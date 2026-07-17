import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { Text } from "../components/Text";

/**
 * Tom da confirmacao. Igual, por estrutura, ao FeedbackTone do core - a UI e
 * puramente apresentacional e nao depende do dominio.
 */
export type FeedbackTone = "success" | "info" | "danger";

export interface FeedbackBannerProps {
  /** Texto ja traduzido; renderizado apenas como texto (sem markup). */
  text: string;
  tone: FeedbackTone;
  /** Maior, com glifo e enfase de cor solida; o host adiciona o haptico. */
  reinforced: boolean;
  /** Controle opcional de fechar manual (>= 48dp). */
  onDismiss?: () => void;
  /** Rotulo acessivel do controle de fechar (traduzido pelo chamador). */
  dismissLabel?: string;
}

/** Glifo de reforco: uma marca de confirmacao, so no modo reforcado. */
const REINFORCING_GLYPH = "✓";

/**
 * Surface de confirmacao: um unico lugar consistente (rodape, centro),
 * marcada como live region "polite" com role "status" para a tecnologia
 * assistiva anunciar a mensagem assim que o texto muda. As cores vem apenas dos
 * papeis do design system - nunca hex - entao AA/AAA valem nas duas
 * paletas. No modo reforcado a mensagem fica maior, ganha um glifo e usa a cor
 * solida do papel. A entrada faz um fade suave, suprimido sob reducao de
 * movimento (mesmo padrao do TourOverlay). Componente puro, dirigido por props.
 */
export function FeedbackBanner({
  text,
  tone,
  reinforced,
  onDismiss,
  dismissLabel,
}: FeedbackBannerProps) {
  const { colors, space, radii, ergonomics, shadow } = useTheme();
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
  }, [opacity, reduceMotion, text]);

  const roles: Record<FeedbackTone, { soft: [string, string]; solid: [string, string] }> = {
    success: { soft: [colors.successSoft, colors.success], solid: [colors.success, colors.successInk] },
    info: { soft: [colors.surface2, colors.ink], solid: [colors.accent, colors.accentInk] },
    danger: { soft: [colors.dangerSoft, colors.danger], solid: [colors.danger, colors.dangerInk] },
  };
  const [background, foreground] = reinforced ? roles[tone].solid : roles[tone].soft;
  const textVariant = reinforced ? "title" : "label";

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          alignItems: "center",
          justifyContent: "flex-end",
          padding: space.lg,
          opacity,
          zIndex: 900,
        },
      ]}
    >
      <View
        accessibilityLiveRegion="polite"
        role="status"
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: space.sm,
          maxWidth: 560,
          width: "100%",
          backgroundColor: background,
          borderRadius: radii.lg,
          paddingVertical: space.md,
          paddingHorizontal: space.lg,
          ...shadow.native,
        }}
      >
        {reinforced ? (
          <Text variant={textVariant} weight="bold" color={foreground}>
            {REINFORCING_GLYPH}
          </Text>
        ) : null}
        <Text variant={textVariant} color={foreground} style={{ flexShrink: 1 }}>
          {text}
        </Text>
        {onDismiss ? (
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel={dismissLabel}
            style={{
              minWidth: ergonomics.touchTargetMin,
              minHeight: ergonomics.touchTargetMin,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "auto",
            }}
          >
            <Text variant="title" weight="bold" color={foreground}>
              {"×"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}
