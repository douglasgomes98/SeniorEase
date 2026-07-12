import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppNavigator } from "@senior-ease/features";
import { AppProviders } from "./src/bootstrap/app-providers";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <AppNavigator />
        </SafeAreaView>
        <StatusBar style="auto" />
      </AppProviders>
    </SafeAreaProvider>
  );
}
