# Regressão visual Web e Expo Web

## Objetivo

Detectar regressões visuais nas cinco telas principais de cada entrada web do
SeniorEase: Next.js e Expo Web.

## Escopo

- Telas: início, atividades, personalização, perfil e histórico.
- Endpoints já em execução: Next.js em `http://127.0.0.1:3000` e Expo Web em
  `http://127.0.0.1:8081`.
- Viewports: 390 x 844 (móvel) e 1440 x 900 (desktop).
- Uma baseline independente para cada combinação de entrada e viewport.

## Implementação

Adicionar Playwright à raiz do monorepo, com quatro projetos: `web-mobile`,
`web-desktop`, `mobile-web-mobile` e `mobile-web-desktop`. Uma suíte navega a
partir da Home pelos `testID`s já expostos e captura uma imagem por tela.

Os comandos serão `pnpm visual:test` para comparar e `pnpm visual:update` para
aprovar alterações visuais intencionais. As imagens aprovadas serão
versionadas junto da suíte.

## Limites

Os snapshots não comparam Next e Expo Web pixel a pixel. Cada entrada é
comparada à sua própria baseline para evitar falsos positivos de motores de
renderização diferentes. A validação Android nativa fica fora deste primeiro
setup e poderá usar capturas do emulador posteriormente.
