import { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { Button } from "../components/Button";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";
import {
  ActivityStepControls,
  type ActivityStepControlsLabels,
} from "./ActivityStepControls";

export interface ActivityRunnerViewLabels extends ActivityStepControlsLabels {
  /** Mensagem de confirmacao quando a atividade nao tem passos. */
  noSteps: string;
  /** Afordancia de sair sem concluir (ambos os modos). */
  close: string;
}

export interface ActivityRunnerViewProps {
  /** Titulo da atividade; renderizado apenas como Text (conteudo do usuario). */
  header: string;
  hasSteps: boolean;
  /** Texto do passo atual ("" quando nao ha passos); apenas como Text. */
  stepText: string;
  isFirst: boolean;
  isLast: boolean;
  labels: ActivityRunnerViewLabels;
  onPrevious: () => void;
  /** Avanca; o container conclui quando esta no ultimo passo. */
  onNext: () => void;
  /** Conclui a atividade sem passos (painel de confirmacao). */
  onFinish: () => void;
  /** Fecha o runner sem concluir. */
  onClose: () => void;
}

/**
 * Runner apresentacional da execucao guiada, em camada modal de tela cheia
 * (espelha o overlay do tour). Mostra o titulo da atividade e o passo atual com
 * os controles quando ha passos, ou um painel unico com um so Concluir quando
 * nao ha; sempre com uma afordancia de fechar. A troca de passo faz um fade
 * suave, suprimido sob preferencia de reducao de movimento. Todo texto do
 * usuario e renderizado apenas como Text. Puro e dirigido por props - sem regra
 * de negocio nem i18n.
 */
export function ActivityRunnerView({
  header,
  hasSteps,
  stepText,
  isFirst,
  isLast,
  labels,
  onPrevious,
  onNext,
  onFinish,
  onClose,
}: ActivityRunnerViewProps) {
  const { colors, space, radii } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  // Fade a cada troca de passo; suprimido quando ha reducao de movimento.
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
  }, [opacity, reduceMotion, stepText, hasSteps]);

  return (
    <View
      accessibilityViewIsModal
      testID="activity-runner"
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: colors.overlay,
          alignItems: "center",
          justifyContent: "center",
          padding: space.lg,
          zIndex: 1000,
        },
      ]}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 520,
          backgroundColor: colors.bg,
          borderRadius: radii.lg,
          padding: space.lg,
          gap: space.lg,
        }}
      >
        <Text variant="heading" accessibilityRole="header">
          {header}
        </Text>

        {hasSteps ? (
          <Stack gap="lg">
            <Animated.View style={{ opacity }}>
              <Text variant="title">{stepText}</Text>
            </Animated.View>
            <ActivityStepControls
              isFirst={isFirst}
              isLast={isLast}
              labels={labels}
              onPrevious={onPrevious}
              onNext={onNext}
            />
          </Stack>
        ) : (
          <Stack gap="lg">
            <Text variant="body">{labels.noSteps}</Text>
            <Button
              label={labels.finish}
              variant="primary"
              onPress={onFinish}
              testID="activity-runner-finish"
            />
          </Stack>
        )}

        <Button
          label={labels.close}
          variant="ghost"
          onPress={onClose}
          testID="activity-runner-close"
        />
      </View>
    </View>
  );
}
