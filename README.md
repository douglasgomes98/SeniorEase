# SeniorEase

Plataforma de acessibilidade digital que ajuda pessoas idosas a realizar suas
atividades academicas e profissionais com autonomia, confianca e dignidade.
Entregue simultaneamente como aplicacao Web (Next.js + react-native-web) e
Mobile (Expo / React Native) a partir de uma unica base de codigo sob Clean
Architecture, para que cada capacidade tenha a mesma aparencia e o mesmo
comportamento nas duas plataformas.

Todos os dados vivem no dispositivo: nao ha login, backend, sincronizacao em
nuvem, analytics nem coleta de dados pessoais.

## O produto

O SeniorEase responde as dores tipicas do publico idoso — texto pequeno, baixo
contraste, botoes minusculos, excesso de informacao, navegacao imprevisivel,
falta de feedback e medo de erros irreversiveis — com tres pilares e um
conjunto de capacidades transversais.

### Painel de Personalizacao da Experiencia

- Tamanho da fonte: controles A- / A+ em passos de 15%, de 100% a 200%, com
  os controles desabilitando nos limites e o percentual atual anunciado.
- Contraste: padrao (WCAG AA, >= 4.5:1) ou maximo (WCAG AAA, >= 7:1).
- Espacamento entre elementos: 1.0 / 1.25 / 1.5.
- Simplificacao da interface: modo de navegacao simples (no maximo 4 destinos
  na home) ou completo.
- Feedback visual reforcado: confirmacoes maiores, mais longas (5 s) e com
  resposta haptica no Android.
- Confirmacoes extras antes de acoes criticas (ligado por padrao).

Cada ajuste aplica imediatamente em runtime — o tema e re-resolvido e toda a
interface re-renderiza — e persiste entre sessoes.

### Organizador de Atividades Simplificado

- Lista unica e direta: criar atividade exige apenas um titulo (ate 80
  caracteres); descricao, ate 20 passos ordenados e prazo com data/hora sao
  opcionais. Pendentes aparecem primeiro, com o prazo mais proximo no topo.
- Execucao guiada: a atividade roda um passo por vez, com indicador
  "passo X de Y", avancar e voltar livres e um Concluir claro no final;
  atividades sem passos concluem em uma unica acao confirmada.
- Lembretes e notificacoes: ao abrir o app, proximas e atrasadas sao
  destacadas com banner e etiquetas; notificacoes locais do sistema
  (expo-notifications no Mobile, Web Notifications API na Web) disparam no
  prazo menos a antecedencia configurada, mesmo com o app fechado. A permissao
  e pedida uma unica vez, em linguagem clara, e a negativa degrada
  graciosamente para lembretes dentro do app. Horas de silencio suprimem
  notificacoes do sistema na janela configurada.
- Historico: lista somente leitura das atividades concluidas (mais recente
  primeiro, ate 200 registros), com data/hora de conclusao formatada no idioma
  do usuario e limpeza protegida por confirmacao.

### Perfil com Configuracoes Persistentes

- Nome de exibicao opcional (ate 40 caracteres) que personaliza a saudacao.
- Selecao de idioma: portugues (padrao), ingles e espanhol.
- Preferencias de notificacao: liga/desliga geral, antecedencia padrao
  (5 / 15 / 30 / 60 / 1440 minutos), canal de entrega (no app / sistema /
  ambos) e horas de silencio opcionais (janela padrao 22:00-07:00).
- Resumo somente leitura da aparencia com atalho para a Personalizacao.
- Restaurar padroes recomendados, sempre precedido de confirmacao.

### Capacidades transversais

- Tour guiado de onboarding no primeiro acesso, com avancar, voltar, pular e
  indicador de passos; pode ser reaberto a qualquer momento e nao reaparece
  automaticamente depois de concluido ou pulado.
- Feedback apos toda acao que muda estado: mensagem visivel em ate 500 ms em
  local consistente, anunciada a leitores de tela; conclusoes usam tom
  positivo e encorajador.
- Portao de confirmacao para acoes destrutivas (excluir tarefa, limpar
  historico, restaurar padroes): dialogo acessivel que nomeia exatamente o que
  vai acontecer, com foco preso, cancelar como foco seguro e confirmacao na
  cor de perigo.
- Internacionalizacao completa em pt/en/es: nenhuma string fixa na interface;
  catalogos tipados garantem que nenhuma chave falte em nenhum idioma.

## Arquitetura

Monorepo (pnpm workspaces + Turborepo) sob Clean Architecture, com direcao de
dependencia sempre do mais externo para o mais interno.

```
apps/
  web/        Next.js (App Router, client) + react-native-web  -> Vercel
  mobile/     Expo (React Native)                               -> APK Android
packages/
  core/       dominio + casos de uso + ports + estado (Zustand)   [nucleo, puro]
  i18n/       internacionalizacao pt/en/es (autoridade de locale)
  ui/         componentes cross apresentacionais (zero regra de negocio)
  features/   containers que ligam estado + i18n aos componentes
  config/     tsconfig base + preset de ESLint compartilhados
```

Camadas do `core`:

- `domain`: entidades e value objects com invariantes (funcoes puras, sem React
  nem plataforma). As regras de negocio moram aqui.
- `application`: casos de uso independentes de UI e ports (interfaces).
  Inversao de Dependencia: o nucleo depende de abstracoes, nunca de
  localStorage/AsyncStorage.
- `state`: stores Zustand que injetam os casos de uso. Os componentes leem via
  seletores e disparam acoes - sem regra de negocio na UI.

Componentes cross: escritos com primitivas `react-native` e executados na Web
via `react-native-web` (o `apps/web/next.config.js` faz o alias `react-native`
-> `react-native-web` e transpila os pacotes compartilhados). O mesmo
componente roda em Web e Mobile.

Ports e adapters: as portas de armazenamento e de agendamento de notificacao
sao definidas no `core`; cada app injeta o adaptador da plataforma no
composition root (localStorage e Web Notifications na Web; AsyncStorage e
expo-notifications no Mobile).

Persistencia: preferencias e atividades sao gravadas juntas em um unico
envelope versionado (chave `seniorease.v1`). Tudo que volta do armazenamento e
tratado como nao confiavel e validado campo a campo com schema Zod antes de
entrar no dominio; dados corrompidos, invalidos ou de versao desconhecida caem
silenciosamente para padroes seguros, sem quebrar o app.

## Acessibilidade

- Tipografia Atkinson Hyperlegible (desenhada para baixa visao) nas duas
  plataformas, com line-height 1.5 e escala tipografica ampliada; icones
  Material Symbols Rounded sempre acompanhados de rotulo de texto.
- Alvos de toque >= 48dp em todos os elementos interativos (WCAG 2.5.8);
  altura padrao de controle 52 e grande 60.
- Indicador de foco visivel em todo elemento focavel: anel de 3px com
  offset de 2px.
- Duas paletas curadas com papeis semanticos: padrao (WCAG AA) e maxima
  (WCAG AAA); cores sempre pelos papeis do design system, nunca hex na UI.
- Animacoes suaves que desligam por completo quando o sistema pede reducao de
  movimento (WCAG 2.3.3).
- Toda confirmacao e anunciada a tecnologias assistivas (aria-live /
  announcements nativos).

## Seguranca de frontend (OWASP Top 10)

- A03 (XSS): proibido `dangerouslySetInnerHTML` e `eval` (regras de ESLint);
  texto do usuario sempre renderizado como texto, nunca como markup; validacao
  de dados de fronteira com Zod; Content-Security-Policy restritiva.
- A05 (Misconfiguration): cabecalhos de seguranca em `next.config.js` e
  `vercel.json` (CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy).
- A02 (Cripto): HTTPS/HSTS; sem segredos no bundle; apenas `.env.example`
  versionado.
- A06/A08 (Componentes/Integridade): versoes fixas, lockfile versionado,
  `pnpm audit` no CI; schema versionado protege a leitura do armazenamento
  local contra dados adulterados.
- Menor privilegio: permissao de notificacao pedida uma unica vez e somente
  quando o usuario habilita; conteudo da notificacao limitado ao titulo da
  atividade.

## Stack e versoes

- Web: Next.js 14.2, React 18.3.1, react-native-web 0.19.
- Mobile: Expo SDK 52 (React 18.3.1, React Native 0.76).
- Estado: Zustand 4.5. Validacao: Zod 3.23. Linguagem: TypeScript 5.4.
- Testes: Vitest (dominio, casos de uso, stores e componentes com jsdom +
  react-native-web).

Nota sobre a versao do Expo: o SDK 52 (React 18.3.1) foi escolhido por ser o
alicerce React 18 mais estavel e coeso com o Next.js 14 para o monorepo
cross-platform. O caminho de atualizacao e executar
`pnpm --filter @senior-ease/mobile exec expo install --fix`.

## Como executar

Pre-requisitos: Node 18.18+, pnpm 9 e (para o APK) Java 17, Android SDK e um
emulador.

```
pnpm install

# Qualidade
pnpm typecheck
pnpm lint
pnpm test

# Web
pnpm web:dev       # desenvolvimento
pnpm web:build     # producao

# Mobile
pnpm mobile:start  # Expo dev server
pnpm apk           # gera o APK e instala no emulador em execucao
```

Observacao: em desenvolvimento a CSP restritiva bloqueia o Fast Refresh do
Next.js; para verificar a interatividade da Web use o build de producao
(`pnpm web:build`).

## Deploy

- Web na Vercel: `vercel.json` configura o build via Turborepo e os cabecalhos
  de seguranca. O workflow `.github/workflows/deploy-web.yml` faz o deploy no
  push para `main` (requer os segredos `VERCEL_TOKEN`, `VERCEL_ORG_ID`,
  `VERCEL_PROJECT_ID`).
- APK Android: `scripts/build-apk.sh` roda `expo prebuild` e
  `gradlew assembleRelease`, gerando o APK para o emulador. O workflow
  `.github/workflows/build-apk.yml` publica o APK como artefato.

## Governanca de commits

- Tipos permitidos: `feat` (implementacao), `fix` (correcao de bug),
  `docs` (README).
- Formato do assunto: `feat: implementacao da home do usuario`.
- Proibido: emoji, co-author, ponto final no assunto, linguagem vaga.
- Validacao automatica via commitlint no hook `commit-msg`.

## Governanca de versionamento

O `.gitignore` bloqueia, em qualquer hipotese, o versionamento de documentacao
interna (`docs/`), de qualquer markdown exceto este `README.md`, de pastas de
ferramentas locais de desenvolvimento, de `.env` (apenas `.env.example` e
versionado), de `node_modules` e de artefatos de build.
