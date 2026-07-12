import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Desmonta a arvore renderizada entre os testes para evitar vazamento de DOM.
afterEach(() => {
  cleanup();
});
