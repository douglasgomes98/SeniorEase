import { cleanup } from "@testing-library/react";
import { AccessibilityInfo } from "react-native";
import { afterEach } from "vitest";

// react-native-web omite esta assinatura; o hook sempre a limpa ao desmontar.
AccessibilityInfo.addEventListener = () => ({ remove: () => undefined });

afterEach(cleanup);
