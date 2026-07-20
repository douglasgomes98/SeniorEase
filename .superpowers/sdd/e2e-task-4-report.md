# Task 4 — Personalização E2E

## Alteração

- Adicionado `apps/web/e2e/personalization.spec.ts` com o cenário solicitado: personalização, modo simples e persistência após reload.
- Não houve alteração de produção, mobile, regressão visual ou README.

## Validação

- `pnpm test:e2e --project="Desktop Chrome" apps/web/e2e/personalization.spec.ts` — falha.
- `pnpm test:e2e --project="Mobile Chrome" apps/web/e2e/personalization.spec.ts` — falha.
- `pnpm test:e2e -- apps/web/e2e/personalization.spec.ts` — executou toda a suíte por causa do `--`; 8 passaram e 4 falharam.

## Resultado

O reload abre a tela Início, portanto o cenário reabre Personalização antes de verificar as preferências persistidas. Com esse ajuste de navegação, o teste passa nos projetos Desktop Chrome e Mobile Chrome. Não foi adicionado `waitForTimeout` nem modificado código de produção.
