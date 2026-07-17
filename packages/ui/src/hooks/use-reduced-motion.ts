import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Indica se o usuario pediu reducao de movimento (SO / prefers-reduced-motion).
 * As animacoes devem ser suaves e controlaveis: quando ativo, elas sao
 * suprimidas. Funciona em Web (via react-native-web) e Mobile.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) {
          setReduced(value);
        }
      })
      .catch(() => {
        /* recurso indisponivel: mantem o padrao (sem reducao) */
      });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
