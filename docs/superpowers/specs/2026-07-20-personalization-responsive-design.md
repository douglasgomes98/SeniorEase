# Personalização responsiva

## Objetivo

Impedir colisão, corte ou sobreposição dos rótulos da tela de personalização
em português quando a largura é 390px e as preferências chegam a fonte 200% e
espaçamento 150%. A correção deve valer no web e no mobile porque ambos usam a
mesma UI compartilhada.

## Escopo

- Alterar somente o layout compartilhado de `SegmentedControl` para que seus
  botões possam quebrar naturalmente para novas linhas.
- Manter os rótulos completos, centralizados e com alvo de toque de ao menos
  48dp.
- Em espaço suficiente, preservar uma única linha; em espaço insuficiente,
  cada botão ocupa apenas a largura necessária e segue para a próxima linha.
- Não criar variante nem prop específica da tela de personalização.
- Adicionar cobertura de regressão visual em português para `web` e
  `mobile-web`, no viewport de 390px, com `fontScale: 2` e
  `spacingScale: 1.5`.

## Arquitetura e fluxo

`PersonalizationScreen` continua traduzindo e fornecendo dados. A
`PersonalizationView` continua apenas compondo a tela. `SegmentedControl`, em
`packages/ui`, deixa de impor a distribuição rígida de largura igual e passa a
usar quebra de linha no contêiner de opções. Assim, contraste, espaçamento e
modo de navegação recebem o comportamento sem lógica duplicada em qualquer
plataforma.

Os testes visuais reutilizam a preparação por `localStorage` já usada em
`e2e/visual.spec.ts`; um caso adicional inicializa as preferências no máximo e
captura somente o viewport mobile para os dois endpoints já configurados. O
caso padrão continua inalterado.

## Verificação

- Teste unitário do `SegmentedControl` confirma o estilo de quebra de linha
  juntamente com os contratos acessíveis existentes.
- Snapshots do caso máximo em português confirmam que a tela inteira é
  renderizada sem a sobreposição vista no snapshot atual.
- Executar o teste focado de UI e `pnpm visual:test`; em seguida, `pnpm lint`,
  `pnpm typecheck` e `pnpm test` antes da revisão.

## Fora de escopo

- Novos idiomas na matriz visual.
- Alterações de conteúdo, tokens, regras de preferência ou navegação.
- Layout exclusivo por plataforma ou novas dependências.
