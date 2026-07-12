/**
 * Reforco haptico de sucesso: no-op nas plataformas sem suporte (Web e iOS). A
 * implementacao real vive em "trigger-haptic.android.ts", resolvida pelo Metro
 * apenas no Android - assim o bundle Web nunca referencia "expo-haptics".
 */
export function triggerHaptic(): void {
  /* no-op: o reforco haptico existe apenas no Android */
}
