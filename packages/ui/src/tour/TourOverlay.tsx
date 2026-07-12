import { type ReactNode, useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface TourOverlayProps {
  children: ReactNode;
}

/**
 * Camada modal do tour: escurece o fundo e centraliza o conteudo. Faz um fade
 * suave de entrada, suprimido quando ha preferencia por reducao de movimento.
 * Puro, dirigido por props.
 */
export function TourOverlay({ children }: TourOverlayProps) {
  const { colors, space } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: Platform.OS !== "web",
    });
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      accessibilityViewIsModal
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: colors.overlay,
          alignItems: "center",
          justifyContent: "center",
          padding: space.lg,
          opacity,
          zIndex: 1000,
        },
      ]}
    >
      <View style={{ width: "100%", maxWidth: 520 }}>{children}</View>
    </Animated.View>
  );
}
