# Task 4 — Personalização E2E

## Alteração

- Adicionado `apps/web/e2e/personalization.spec.ts` com o cenário solicitado: personalização, modo simples e persistência após reload.
- Não houve alteração de produção, mobile, regressão visual ou README.

## Validação

- `pnpm test:e2e --project="Desktop Chrome" apps/web/e2e/personalization.spec.ts` — falha.
- `pnpm test:e2e --project="Mobile Chrome" apps/web/e2e/personalization.spec.ts` — falha.
- `pnpm test:e2e -- apps/web/e2e/personalization.spec.ts` — executou toda a suíte por causa do `--`; 8 passaram e 4 falharam.

## Bloqueio

Nos dois projetos, depois de `page.reload()` a aplicação abre a tela Início, não Personalização. Por isso o texto `Tamanho da fonte: 115%` não existe no DOM. O contexto de erro mostra a opção “Continuar de onde parou: Personalizacao”, confirmando que o reload não preserva a rota ativa. Não é sincronização de hidratação e não foi adicionado `waitForTimeout` nem modificado código de produção.

Também falhou, fora do escopo desta tarefa, o cenário existente de histórico: `destination-history` não fica disponível após concluir a atividade.
