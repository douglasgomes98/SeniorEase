/**
 * Tipos minimos do modulo nativo "@react-native-community/datetimepicker"
 * usados aqui. A dependencia e apenas do app mobile (o Metro a resolve no
 * Android); o tsc compartilhado nao a instala. Esta declaracao ambiente fornece
 * os tipos sem acopla-la ao Web, espelhando "features/feedback/expo-haptics.d.ts".
 */
declare module "@react-native-community/datetimepicker" {
  import type { ComponentType } from "react";

  export interface DateTimePickerEvent {
    type: "set" | "dismissed";
  }

  export interface DateTimePickerProps {
    value: Date;
    mode?: "date" | "time";
    is24Hour?: boolean;
    onChange?: (event: DateTimePickerEvent, date?: Date) => void;
  }

  const DateTimePicker: ComponentType<DateTimePickerProps>;
  export default DateTimePicker;
}
