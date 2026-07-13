import { useState } from "react";
import { View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTheme } from "../theme/theme-context";
import { Button } from "./Button";
import { Stack } from "./Stack";
import { Text } from "./Text";
import type { DateTimeFieldProps } from "./DateTimeField";

type PickerMode = "date" | "time";

function pad(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

/** Formata para o mesmo ISO local da Web (YYYY-MM-DDTHH:mm), sem timezone. */
function toLocalIso(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function parseValue(value: string): Date {
  if (value === "") {
    return new Date();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Campo de data/hora (Android). Mesmo contrato do arquivo padrao: um botao abre
 * o seletor nativo da comunidade em dois passos (data e depois hora), formata a
 * escolha para ISO local e permite remover a data. O Metro carrega este arquivo
 * apenas no Android, entao a dependencia nativa nunca entra no bundle Web. Puro
 * e dirigido por props.
 */
export function DateTimeField({
  value,
  onChange,
  label,
  clearLabel,
  accessibilityLabel,
  testID,
}: DateTimeFieldProps) {
  const { space } = useTheme();
  const [mode, setMode] = useState<PickerMode | null>(null);
  const [draftDate, setDraftDate] = useState<Date | null>(null);

  const openPicker = () => {
    setDraftDate(parseValue(value));
    setMode("date");
  };

  const closePicker = () => {
    setMode(null);
    setDraftDate(null);
  };

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === "dismissed" || !selected) {
      closePicker();
      return;
    }
    if (mode === "date") {
      setDraftDate(selected);
      setMode("time");
      return;
    }
    const base = draftDate ?? selected;
    const combined = new Date(base);
    combined.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onChange(toLocalIso(combined));
    closePicker();
  };

  const buttonLabel = value === "" ? label : value.slice(0, 16).replace("T", " ");

  return (
    <Stack gap="sm">
      <Text variant="label">{label}</Text>
      <View style={{ flexDirection: "row", gap: space.sm, alignItems: "center" }}>
        <Button
          label={buttonLabel}
          variant="secondary"
          onPress={openPicker}
          accessibilityLabel={accessibilityLabel ?? label}
          testID={testID}
          style={{ flexGrow: 1, flexBasis: 0 }}
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
      {mode !== null ? (
        <DateTimePicker
          value={draftDate ?? new Date()}
          mode={mode}
          is24Hour
          onChange={handleChange}
        />
      ) : null}
    </Stack>
  );
}
