// Estende os matchers de `expect` do vitest com @testing-library/jest-dom
// (toHaveStyle, toHaveAttribute, toBeInTheDocument, ...). Importado no runtime
// por vitest.setup.ts; este arquivo em src/ carrega a mesma augmentacao no
// type-check.
import "@testing-library/jest-dom/vitest";
