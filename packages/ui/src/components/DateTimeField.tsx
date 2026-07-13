import { View } from "react-native";
import { useTheme } from "../theme/theme-context";
import { Button } from "./Button";
import { Stack } from "./Stack";
import { Text } from "./Text";

export interface DateTimeFieldProps {
  /** Valor ISO 8601 local (YYYY-MM-DDTHH:mm) ou "" quando nao ha vencimento. */
  value: string;
  onChange: (isoOrEmpty: string) => void;
  /** Rotulo ja traduzido. */
  label: string;
  /** Rotulo ja traduzido da acao de remover a data/hora. */
  clearLabel: string;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Campo de data/hora (Web e padrao). Renderiza o controle nativo do navegador
 * (`datetime-local`), familiar e acessivel, e emite o valor como string ISO
 * local; um botao remove a data quando ha uma. A versao Android usa o seletor
 * nativo da comunidade no arquivo `.android.tsx` com o mesmo contrato. Este
 * arquivo so entra no bundle Web, onde elementos DOM convivem com o
 * react-native-web. Puro e dirigido por props.
 */
export function DateTimeField({
  value,
  onChange,
  label,
  clearLabel,
  accessibilityLabel,
  testID,
}: DateTimeFieldProps) {
  const { colors, space, radii, ergonomics, font, fontFamily } = useTheme();

  return (
    <Stack gap="sm">
      <Text variant="label">{label}</Text>
      <View style={{ flexDirection: "row", gap: space.sm, alignItems: "center" }}>
        <input
          type="datetime-local"
          value={value.slice(0, 16)}
          onChange={(event) => onChange(event.target.value)}
          aria-label={accessibilityLabel ?? label}
          data-testid={testID}
          style={{
            flexGrow: 1,
            minHeight: ergonomics.controlHeight,
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: colors.line,
            borderRadius: radii.md,
            backgroundColor: colors.surface,
            paddingLeft: space.md,
            paddingRight: space.md,
            color: colors.ink,
            fontFamily,
            fontSize: font.body,
          }}
        />
        {value !== "" ? (
          <Button
            label={clearLabel}
            variant="secondary"
            onPress={() => onChange("")}
            testID={testID ? `${testID}-clear` : undefined}
          />
        ) : null}
      </View>
    </Stack>
  );
}
