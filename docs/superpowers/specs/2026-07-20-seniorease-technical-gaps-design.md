# Especificação Técnica de Lacunas — SeniorEase

## 1. Objetivo

Esta especificação cobre apenas lacunas técnicas encontradas ao comparar a
implementação com `seniorease-requirements.md`. Os requisitos funcionais
RF-01 a RF-16 e os requisitos de acessibilidade RA-01 a RA-07 possuem
implementação identificada. Não há novas funcionalidades de produto neste
escopo.

## 2. Linha de Base Verificada

- Web em Next.js e Mobile em Expo/React Native atendem RT-01 e RT-02.
- A organização `core`, `ui`, `features` e os adaptadores de plataforma atende
  RT-03 e RT-05. Não há microapps; RT-04 não se aplica.
- O projeto possui testes unitários para domínio, estado, persistência e
  componentes: 165 testes aprovados na verificação inicial.
- `pnpm test`, `pnpm typecheck` e `pnpm lint` concluíram sem erros em
  2026-07-20.

## 3. Requisitos a Implementar

### LT-01 — Gate de Testes no CI

Os workflows de deploy Web e geração de APK devem executar `pnpm test` após a
instalação das dependências e antes do build/deploy. Uma falha deve interromper
o job e impedir a publicação do artefato ou da aplicação.

**Aceite:** uma alteração que faça um teste falhar torna ambos os workflows
inelegíveis para publicar; uma execução válida preserva os passos atuais de
typecheck, lint, build e deploy.

### LT-02 — Testes de Fluxos Críticos

Devem existir testes de integração para os fluxos compartilhados Web/Mobile:

1. alterar uma preferência e confirmar sua persistência após nova hidratação;
2. criar, executar por etapas e concluir uma atividade, verificando histórico;
3. solicitar confirmação, cancelar e confirmar uma ação destrutiva;
4. alterar preferência de lembretes e verificar a reconciliação com o port de
   notificações por um adaptador falso.

**Aceite:** os testes usam stores e adaptadores controlados, não dependem de
notificações reais nem de armazenamento do dispositivo e rodam em `pnpm test`.

### LT-03 — Verificação Repetível de Acessibilidade

Deve haver uma lista executável de validação dos fluxos críticos nas duas
plataformas: alvos de toque de ao menos 48dp, foco visível na Web, rótulos para
tecnologias assistivas, contraste das paletas, ajuste de fonte/espaçamento e
supressão de animações com redução de movimento.

**Aceite:** testes automatizam o que for observável em componentes; um roteiro
manual versionado cobre leitor de tela, navegação por teclado na Web e redução
de movimento em Web e Android. Falhas impedem o aceite da entrega.

## 4. Fora de Escopo

Não inclui backend, autenticação, sincronização em nuvem, Service Worker para
notificações Web, novos destinos de navegação, nem ampliação do modo simples.
Esses itens não são exigidos pela especificação extraída do Hackathon.
