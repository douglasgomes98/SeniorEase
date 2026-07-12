/**
 * Tipos minimos do modulo nativo "expo-haptics" usados aqui. A dependencia e
 * apenas do app mobile (o Metro a resolve no Android); o tsc compartilhado nao
 * a instala. Esta declaracao ambiente fornece os tipos sem acopla-la ao Web.
 */
declare module "expo-haptics" {
  export const NotificationFeedbackType: { readonly Success: "success" };
  export function notificationAsync(type: unknown): Promise<void>;
}
