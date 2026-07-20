# CI e aprovação de regressão visual

## Objetivo

Validar automaticamente qualidade e regressão visual do SeniorEase em cada
push e pull request. Permitir mudanças visuais intencionais somente após uma
revisão explícita no PR.

## Workflows

### CI

`.github/workflows/ci.yml` executará em `push` e `pull_request`:

- instala dependências com pnpm e Chromium com Playwright;
- executa `pnpm lint`, `pnpm typecheck` e `pnpm test`;
- constrói e inicia o Next.js na porta 3000;
- inicia o Expo Web na porta 8081;
- executa `pnpm visual:test`;
- publica o relatório e os traces do Playwright como artefatos quando houver
  falha.

As baselines usadas nessa execução serão geradas em Linux e versionadas no
repositório, separadas das baselines macOS já existentes pelo sufixo da
plataforma do Playwright.

### Atualização de snapshots

`.github/workflows/update-visual-snapshots.yml` será acionado manualmente em
um branch de PR. Antes de alterar arquivos, ele confirma que o PR associado
tem o rótulo `visual-approved`. Em seguida prepara o mesmo ambiente Linux da
CI, executa `pnpm visual:update`, cria um commit convencional com somente os
snapshots alterados e o envia ao branch escolhido.

O workflow terá permissão `contents: write`. Ele não será usado para commits
de forks nem para contornar proteção de branch; a execução deve ocorrer num
branch gravável do repositório.

## Fluxo de revisão

1. Uma mudança visual gera falha no check Playwright e artefatos de comparação
   no PR.
2. Revisores conferem o relatório e aplicam `visual-approved` quando a mudança
   é desejada.
3. Um mantenedor dispara manualmente a atualização de snapshots no branch do
   PR.
4. O commit de baselines é revisável e a CI volta a validar contra ele.

O rótulo sozinho não transforma uma falha em sucesso: isso impediria que a
baseline fosse atualizada e deixaria a `master` com uma CI permanentemente
vermelha.

## Limites

- A CI cobre as 20 capturas atuais: cinco telas, duas entradas e dois
  viewports.
- Ela não compara Next.js e Expo Web diretamente; cada entrada mantém sua
  baseline.
- A validação de aplicativo Android/iOS nativo permanece fora deste escopo.
