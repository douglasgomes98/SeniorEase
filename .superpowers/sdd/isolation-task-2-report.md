# Task 2 — CI e2e isolado

## Alteração

- Adicionado o job `e2e` em `.github/workflows/ci.yml`.
- O job instala pnpm 9, Node 20, dependências congeladas e Chromium antes de executar `pnpm test:e2e`.
- O job `visual`, o `playwright.config.ts` raiz, o produto, o app mobile e os snapshots não foram alterados.

## Validação

- `pnpm web:build` — passou.
- `pnpm visual:test` com Next em `:3000` e Expo Web em `:8081` — 20 capturas aprovadas.
- `pnpm test:e2e` — 16 testes aprovados.
- `git diff --check` — sem erros; o diff desta tarefa só altera `.github/workflows/ci.yml` e este relatório.
