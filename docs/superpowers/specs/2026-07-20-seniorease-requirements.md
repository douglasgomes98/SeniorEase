# Especificação de Requisitos - SeniorEase

## 1. Objetivo e Escopo

O SeniorEase é uma plataforma para apoiar pessoas idosas em atividades
acadêmicas e profissionais, promovendo autonomia, confiança e inclusão digital.
O projeto deve disponibilizar versões Web e Mobile, coerentes visual e
cognitivamente. Esta especificação consolida apenas os requisitos explícitos
do briefing do Hackathon.

## 2. Plataformas e Arquitetura

- **RT-01:** Desenvolver uma versão Web com React, Angular ou Next.js.
- **RT-02:** Desenvolver uma versão Mobile com Flutter ou React Native.
- **RT-03:** Separar claramente os módulos de painel, tarefas, perfil e
  configurações.
- **RT-04:** Quando houver microapps, definir a comunicação entre eles.
- **RT-05:** Aplicar Clean Architecture: domínio isolado, casos de uso
  independentes da interface e adaptadores/interfaces bem definidos.
- **RT-06:** Aplicar testes, CI/CD e boas práticas de desenvolvimento.

## 3. Requisitos Funcionais

### 3.1 Painel de Personalização da Experiência

- **RF-01:** Permitir ajustar o tamanho da fonte.
- **RF-02:** Permitir selecionar o nível de contraste.
- **RF-03:** Permitir ajustar o espaçamento entre elementos.
- **RF-04:** Oferecer simplificação da interface nos modos básico e avançado.
- **RF-05:** Permitir ativar feedback visual reforçado.
- **RF-06:** Permitir habilitar confirmação adicional antes de ações críticas.

### 3.2 Organizador de Atividades Simplificado

- **RF-07:** Exibir uma lista de tarefas com visual simples e direto.
- **RF-08:** Oferecer etapas guiadas para executar atividades.
- **RF-09:** Fornecer lembretes em linguagem clara.
- **RF-10:** Exibir aviso de conclusão com feedback positivo.
- **RF-11:** Manter um histórico simples de atividades realizadas.

### 3.3 Perfil e Configurações Persistentes

- **RF-12:** Persistir o tamanho de fonte escolhido.
- **RF-13:** Persistir o nível de contraste escolhido.
- **RF-14:** Persistir o modo de navegação, simplificado ou padrão.
- **RF-15:** Persistir a preferência por confirmações extras.
- **RF-16:** Persistir as preferências de lembretes e notificações.

## 4. Requisitos de Acessibilidade para Idosos

Os itens desta seção são obrigatórios.

- **RA-01:** Implementar ajustes reais de legibilidade para fonte, contraste e
  espaçamento.
- **RA-02:** Ampliar botões e demais áreas clicáveis.
- **RA-03:** Fornecer feedback claro após cada ação.
- **RA-04:** Reduzir a complexidade visual da interface.
- **RA-05:** Garantir navegação previsível.
- **RA-06:** Oferecer fluxos guiados passo a passo.
- **RA-07:** Usar animações suaves e controláveis.

## 5. Critérios de Entrega

- **RE-01:** Disponibilizar os projetos no GitHub; é permitido separá-los em
  repositórios distintos.
- **RE-02:** Produzir um vídeo explicativo de até 15 minutos, cobrindo as
  decisões e features relacionadas aos requisitos.
- **RE-03:** Enviar, na plataforma FIAP, um arquivo `.docx` ou `.txt` com os
  links do vídeo e do projeto.

## 6. Limites do Briefing

O briefing não define fluxos de autenticação, backend, modelo de dados,
persistência concreta, critérios de aceitação mensuráveis, cobertura de testes,
configuração de pipeline de CI/CD, navegadores/sistemas operacionais suportados,
nem detalhes de interação para cada ajuste. Esses pontos exigem decisão
posterior e não devem ser tratados como requisitos do Hackathon sem validação.
