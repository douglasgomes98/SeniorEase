import { useEffect } from "react";
import {
  useActivities,
  useFeedback,
  usePreferences,
  useReminders,
} from "@senior-ease/core";
import { useTranslation } from "@senior-ease/i18n";

/**
 * Orquestrador headless de agendamento, montado no shell compartilhado para
 * rodar independente da rota ativa. Semeia a permissao no start, reconcilia o
 * agendamento sempre que a lista de atividades (F09) ou as preferencias de
 * notificacao (F03) mudam, e dispara o pedido de permissao - uma unica vez, em
 * linguagem clara - no momento em que o usuario liga a entrega pelo sistema.
 * Nao renderiza nada; toda a decisao pura vive no dominio e na store.
 */
export function ReminderSync(): null {
  const t = useTranslation();
  const activities = useActivities((state) => state.activities);
  const notifications = usePreferences((state) => state.notifications);

  const hydratePermission = useReminders((state) => state.hydratePermission);
  const requestOsPermission = useReminders(
    (state) => state.requestOsPermission,
  );
  const syncReminders = useReminders((state) => state.syncReminders);
  const permission = useReminders((state) => state.permission);
  const supported = useReminders((state) => state.supported);

  const announce = useFeedback((state) => state.announce);

  // A entrega pelo sistema e "desejada" quando o interruptor mestre esta ligado e
  // o canal contempla o sistema operacional - independente da permissao ainda.
  const osDesired =
    notifications.enabled &&
    (notifications.channel === "os" || notifications.channel === "both");

  // Start: semeia supported + permissao, sem abrir prompt.
  useEffect(() => {
    void hydratePermission();
  }, [hydratePermission]);

  // Pedido unico: quando a entrega pelo sistema passa a ser desejada e a
  // permissao ainda esta indefinida, mostra a justificativa em linguagem clara e
  // pede a permissao uma vez. Negada/concedida deixa de ser "undetermined", entao
  // nao repergunta em laco; quem so quer avisos no app nunca e interrompido.
  useEffect(() => {
    if (supported && osDesired && permission === "undetermined") {
      announce(t("reminders.permission.rationale"));
      void requestOsPermission();
    }
  }, [supported, osDesired, permission, announce, t, requestOsPermission]);

  // Reconcilia a cada mudanca de atividades/preferencias/permissao. O heading da
  // notificacao e resolvido por i18n aqui e passado como string ao adaptador.
  useEffect(() => {
    void syncReminders(activities, notifications, t("reminders.notification.heading"));
  }, [activities, notifications, permission, supported, syncReminders, t]);

  return null;
}
