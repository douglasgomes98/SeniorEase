import { defineConfig } from "vitest/config";

/**
 * Testes unitarios da UI. Ambiente "jsdom" para exercitar os componentes RN
 * atraves do react-native-web (a mesma saida que a Web renderiza). O alias
 * mapeia "react-native" -> "react-native-web", como no bundle da Web.
 */
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "react-native": "react-native-web",
    },
  },
});
