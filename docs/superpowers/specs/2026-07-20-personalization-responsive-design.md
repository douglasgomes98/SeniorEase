# Personalização responsiva

## Objetivo

Impedir colisão, corte ou sobreposição dos rótulos das telas de personalização
e perfil em português quando a largura é 390px e as preferências chegam a
fonte 200% e espaçamento 150%. A correção deve valer no web e no mobile porque
ambos usam a mesma UI compartilhada.

## Escopo

- Alterar o layout compartilhado de `SegmentedControl` para usar uma coluna
  única até 600px e quebrar naturalmente para novas linhas acima desse limite.
- Manter os rótulos completos, centralizados e com alvo de toque de ao menos
  48dp.
- Acima de 600px, preservar uma única linha quando houver espaço; abaixo desse
  limite, cada opção ocupa toda a largura disponível.
- Não criar variante nem prop específica da tela de personalização.
- Adicionar cobertura de regressão visual para Personalização e Perfil, em
  português, nos alvos `web-mobile` e `mobile-web-mobile`, com viewport de
  390px, `fontScale: 2` e `spacingScale: 1.5`.

## Arquitetura e fluxo

`PersonalizationScreen` continua traduzindo e fornecendo dados. A
`PersonalizationView` continua apenas compondo a tela. `SegmentedControl`, em
`packages/ui`, lê a largura da janela: até 600px organiza opções em coluna;
acima disso usa quebra natural no contêiner. Assim, contraste, espaçamento e
modo de navegação, idioma, antecedência de lembretes e canal de notificação
recebem o comportamento sem lógica duplicada em qualquer plataforma.

Os testes visuais reutilizam a preparação por `localStorage` já usada em
`e2e/visual.spec.ts`; dois casos adicionais inicializam as preferências no
máximo e capturam Personalização e Perfil somente no viewport mobile para os
dois endpoints já configurados. Os casos padrão continuam inalterados.

## Verificação

- Teste unitário do `SegmentedControl` confirma coluna até 600px, quebra acima
  desse limite e os contratos acessíveis existentes.
- Snapshots máximos em português confirmam que Personalização e Perfil são
  renderizados sem a sobreposição vista nos snapshots atuais.
- Executar o teste focado de UI e `pnpm visual:test`; em seguida, `pnpm lint`,
  `pnpm typecheck` e `pnpm test` antes da revisão.

## Fora de escopo

- Novos idiomas na matriz visual.
- Alterações de conteúdo, tokens, regras de preferência ou navegação.
- Layout exclusivo por plataforma ou novas dependências.
