import { TextInput } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Stack } from "./Stack";
import { Text } from "./Text";

export interface TextFieldProps {
  value: string;
  onChangeText: (next: string) => void;
  /** Rotulo ja traduzido. */
  label: string;
  /** Texto de exemplo ja traduzido. */
  placeholder?: string;
  /** Espelha o limite do dominio (defesa em profundidade na entrada). */
  maxLength?: number;
  multiline?: boolean;
  /** Erro inline ja traduzido (ex.: titulo vazio); pinta a borda e o texto. */
  errorText?: string;
  /** Padrao: o rotulo (+ o erro, quando presente). */
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Campo de texto acessivel: rotulo em Text, entrada com altura confortavel sobre
 * o piso de toque de 48dp, borda por token que vira danger com erro e o anel de
 * foco visivel do sistema (:focus-visible na Web, foco nativo). O erro entra no
 * nome acessivel, entao o leitor de tela o anuncia junto do rotulo. Puro e
 * dirigido por props - sem regra de negocio nem i18n.
 */
export function TextField({
  value,
  onChangeText,
  label,
  placeholder,
  maxLength,
  multiline = false,
  errorText,
  accessibilityLabel,
  testID,
}: TextFieldProps) {
  const { colors, space, radii, ergonomics, font, fontFamily, lineHeight } =
    useTheme();

  const hasError = errorText !== undefined && errorText !== "";
  const resolvedA11yLabel =
    accessibilityLabel ?? (hasError ? `${label}, ${errorText}` : label);

  return (
    <Stack gap="sm">
      <Text variant="label">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSoft}
        maxLength={maxLength}
        multiline={multiline}
        accessibilityLabel={resolvedA11yLabel}
        testID={testID}
        style={{
          minHeight: multiline
            ? ergonomics.touchTargetMin * 2
            : ergonomics.controlHeight,
          borderWidth: 2,
          borderColor: hasError ? colors.danger : colors.line,
          borderRadius: radii.md,
          backgroundColor: colors.surface,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
          color: colors.ink,
          fontFamily,
          fontSize: font.body,
          lineHeight: font.body * lineHeight,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
      {hasError ? (
        <Text variant="caption" color={colors.danger}>
          {errorText}
        </Text>
      ) : null}
    </Stack>
  );
}
