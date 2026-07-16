import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type {
  NotificationPermissionStatus,
  NotificationSchedulerPort,
  ScheduledReminder,
} from "@senior-ease/core";

/** Canal Android dos lembretes; obrigatorio para exibir a notificacao local. */
const ANDROID_CHANNEL_ID = "reminders";

/**
 * Handler em primeiro plano: mostra o alerta mesmo com o app aberto. Definido no
 * carregamento do modulo, uma unica vez, seguindo o idioma do expo-notifications.
 */
Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
});

/** Mapeia o status de permissao do expo para o contrato da porta. */
function mapStatus(
  status: Notifications.PermissionStatus,
): NotificationPermissionStatus {
  if (status === Notifications.PermissionStatus.GRANTED) {
    return "granted";
  }
  if (status === Notifications.PermissionStatus.DENIED) {
    return "denied";
  }
  return "undetermined";
}

/**
 * Adaptador do Mobile: implementa a porta de notificacoes sobre
 * expo-notifications. Agenda uma notificacao local por atividade, chaveada pelo
 * id (que vira o identifier da plataforma), com gatilho por data e conteudo
 * apenas titulo (menor privilegio). Requer dev build/prebuild - o Expo Go no
 * Android nao recebe notificacoes locais no SDK 52+. Zero regra de negocio aqui:
 * o `heading` chega ja traduzido e o `fireAt` ja calculado pelo core.
 */
export class ExpoNotificationScheduler implements NotificationSchedulerPort {
  private androidChannelReady = false;

  isSupported(): boolean {
    return Platform.OS !== "web";
  }

  async getPermission(): Promise<NotificationPermissionStatus> {
    const { status } = await Notifications.getPermissionsAsync();
    return mapStatus(status);
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    const { status } = await Notifications.requestPermissionsAsync();
    return mapStatus(status);
  }

  async schedule(reminder: ScheduledReminder): Promise<void> {
    await this.ensureAndroidChannel();
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.activityId,
      content: { title: reminder.heading, body: reminder.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(reminder.fireAt),
        channelId: ANDROID_CHANNEL_ID,
      },
    });
  }

  async cancel(activityId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(activityId);
  }

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /** Garante o canal Android uma unica vez antes do primeiro agendamento. */
  private async ensureAndroidChannel(): Promise<void> {
    if (Platform.OS !== "android" || this.androidChannelReady) {
      return;
    }
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Lembretes",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    this.androidChannelReady = true;
  }
}
