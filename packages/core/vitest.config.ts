import { defineConfig } from "vitest/config";

/**
 * Testes unitarios do core (dominio, aplicacao e estado). Ambiente "node":
 * as regras aqui sao logica pura e a store Zustand roda sem DOM.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
