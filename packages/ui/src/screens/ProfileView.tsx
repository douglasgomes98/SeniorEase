import { type ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import {
  SegmentedControl,
  type SegmentedOption,
} from "../components/SegmentedControl";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";
import { TextField } from "../components/TextField";
import { Toggle } from "../components/Toggle";

/**
 * Valores de dominio, tipados estruturalmente aqui para manter a UI desacoplada
 * do core (o container passa os value objects equivalentes).
 */
type LocaleValue = "pt" | "en" | "es";
type LeadTimeValue = 5 | 15 | 30 | 60 | 1440;
type ChannelValue = "in-app" | "os" | "both";

export interface ProfileAppearanceRow {
  /** Rotulo ja traduzido (ex.: "Fonte"). */
  label: string;
  /** Valor ja traduzido (ex.: "120%"). */
  value: string;
}

export interface ProfileViewLabels {
  header: string;
  /** Saudacao ja resolvida com/sem o nome pelo container. */
  greeting: string;
  name: { label: string; placeholder: string; error?: string };
  language: { label: string; options: SegmentedOption<LocaleValue>[] };
  notifications: {
    title: string;
    enable: string;
    on: string;
    off: string;
    leadTimeLabel: string;
    leadTimeOptions: SegmentedOption<LeadTimeValue>[];
    channelLabel: string;
    channelOptions: SegmentedOption<ChannelValue>[];
    quietHoursLabel: string;
    quietStartLabel: string;
    quietEndLabel: string;
    /** Erro inline para uma hora "HH:mm" malformada. */
    quietStartError?: string;
    quietEndError?: string;
    /** Fronteira em linguagem clara: entrega pelo sistema e arranjada nos lembretes. */
    osBoundaryNote: string;
  };
  appearance: { title: string; openPanel: string; rows: ProfileAppearanceRow[] };
  reset: string;
  /** Mostrado quando a persistencia falhou (persistenceError). */
  saveFailedNotice?: string;
}

export interface ProfileViewValues {
  displayName: string;
  locale: LocaleValue;
  notifications: {
    enabled: boolean;
    leadTimeMinutes: LeadTimeValue;
    channel: ChannelValue;
    quietHoursEnabled: boolean;
    quietStart: string;
    quietEnd: string;
  };
}

export interface ProfileViewProps {
  labels: ProfileViewLabels;
  values: ProfileViewValues;
  onDisplayNameChange: (next: string) => void;
  onLanguageChange: (next: LocaleValue) => void;
  onToggleNotifications: (enabled: boolean) => void;
  onLeadTimeChange: (next: LeadTimeValue) => void;
  onChannelChange: (next: ChannelValue) => void;
  onToggleQuietHours: (enabled: boolean) => void;
  onQuietStartChange: (next: string) => void;
  onQuietEndChange: (next: string) => void;
  onOpenPersonalization: () => void;
  onReset: () => void;
}

/** Cartao de secao com titulo opcional, ciente do tema. */
function SectionCard({
  title,
  children,
  testID,
}: {
  title?: string;
  children: ReactNode;
  testID?: string;
}) {
  const { colors, space, radii } = useTheme();
  return (
    <View
      testID={testID}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.line,
        borderWidth: 2,
        borderRadius: radii.lg,
        padding: space.lg,
        gap: space.lg,
      }}
    >
      {title ? (
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/**
 * Tela de Perfil (cross unica Web + Mobile). 100% apresentacional: recebe copia
 * traduzida e callbacks por props; nenhuma regra de negocio nem i18n aqui dentro.
 * Reune as cinco secoes - saudacao + nome, idioma, preferencias de lembretes/
 * notificacoes (com horas silenciosas), resumo somente leitura da aparencia com
 * atalho para o painel, e restaurar padroes - alem de um aviso gentil de falha
 * ao salvar.
 */
export function ProfileView(props: ProfileViewProps) {
  const { labels, values } = props;
  const { colors, space, radii } = useTheme();
  const { notifications } = values;

  return (
    <Screen testID="profile-screen">
      <Text variant="heading" accessibilityRole="header">
        {labels.header}
      </Text>
      <Text variant="title">{labels.greeting}</Text>

      {labels.saveFailedNotice ? (
        <View
          accessibilityRole="alert"
          style={{
            backgroundColor: colors.dangerSoft,
            borderColor: colors.danger,
            borderWidth: 2,
            borderRadius: radii.md,
            padding: space.md,
          }}
        >
          <Text variant="body">{labels.saveFailedNotice}</Text>
        </View>
      ) : null}

      {/* Nome de exibicao (opcional, personaliza a saudacao) */}
      <SectionCard testID="profile-name-section">
        <TextField
          label={labels.name.label}
          placeholder={labels.name.placeholder}
          value={values.displayName}
          onChangeText={props.onDisplayNameChange}
          errorText={labels.name.error}
          testID="profile-name"
        />
      </SectionCard>

      {/* Idioma */}
      <SectionCard testID="profile-language-section">
        <Stack gap="sm">
          <Text variant="body">{labels.language.label}</Text>
          <SegmentedControl
            options={labels.language.options}
            value={values.locale}
            onChange={props.onLanguageChange}
            accessibilityLabel={labels.language.label}
            testID="profile-language"
          />
        </Stack>
      </SectionCard>

      {/* Lembretes e notificacoes */}
      <SectionCard
        title={labels.notifications.title}
        testID="profile-notifications-section"
      >
        <Toggle
          label={labels.notifications.enable}
          value={notifications.enabled}
          onValueChange={props.onToggleNotifications}
          onLabel={labels.notifications.on}
          offLabel={labels.notifications.off}
          testID="profile-notifications-enabled"
        />

        <Stack gap="sm">
          <Text variant="body">{labels.notifications.leadTimeLabel}</Text>
          <SegmentedControl
            options={labels.notifications.leadTimeOptions}
            value={notifications.leadTimeMinutes}
            onChange={props.onLeadTimeChange}
            accessibilityLabel={labels.notifications.leadTimeLabel}
            testID="profile-lead-time"
          />
        </Stack>

        <Stack gap="sm">
          <Text variant="body">{labels.notifications.channelLabel}</Text>
          <SegmentedControl
            options={labels.notifications.channelOptions}
            value={notifications.channel}
            onChange={props.onChannelChange}
            accessibilityLabel={labels.notifications.channelLabel}
            testID="profile-channel"
          />
        </Stack>

        <Toggle
          label={labels.notifications.quietHoursLabel}
          value={notifications.quietHoursEnabled}
          onValueChange={props.onToggleQuietHours}
          onLabel={labels.notifications.on}
          offLabel={labels.notifications.off}
          testID="profile-quiet-hours"
        />

        {notifications.quietHoursEnabled ? (
          <Stack gap="md">
            <TextField
              label={labels.notifications.quietStartLabel}
              value={notifications.quietStart}
              onChangeText={props.onQuietStartChange}
              errorText={labels.notifications.quietStartError}
              maxLength={5}
              testID="profile-quiet-start"
            />
            <TextField
              label={labels.notifications.quietEndLabel}
              value={notifications.quietEnd}
              onChangeText={props.onQuietEndChange}
              errorText={labels.notifications.quietEndError}
              maxLength={5}
              testID="profile-quiet-end"
            />
          </Stack>
        ) : null}

        <Text variant="caption" muted>
          {labels.notifications.osBoundaryNote}
        </Text>
      </SectionCard>

      {/* Resumo somente leitura da aparencia + atalho para o painel */}
      <SectionCard
        title={labels.appearance.title}
        testID="profile-appearance-section"
      >
        <Stack gap="sm">
          {labels.appearance.rows.map((row) => (
            <Stack
              key={row.label}
              direction="row"
              gap="md"
              justify="space-between"
            >
              <Text variant="body" muted style={{ flexShrink: 1 }}>
                {row.label}
              </Text>
              <Text variant="body" weight="medium">
                {row.value}
              </Text>
            </Stack>
          ))}
        </Stack>
        <Button
          label={labels.appearance.openPanel}
          variant="secondary"
          onPress={props.onOpenPersonalization}
          testID="profile-open-personalization"
        />
      </SectionCard>

      {/* Restaurar padroes (portao de confirmacao no container) */}
      <Button
        label={labels.reset}
        variant="danger"
        onPress={props.onReset}
        testID="profile-reset"
      />
    </Screen>
  );
}
