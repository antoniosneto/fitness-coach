# Code Review com IA – Guia de Uso e Deep Research

Este documento descreve como usar uma **IA para code review** de Pull Requests, alinhada aos agentes (Arquiteto, Backend), ao **objective.md**, ao **PRD** e ao **refinamento técnico** do Épico 1, e como solicitar um **deep research** para automatizar esse fluxo.

---

## 1. Recursos do Cursor: nativos e extensões

### 1.1 Recursos nativos (sem plugin)

O Cursor já traz ferramentas de review que você pode usar junto com a nossa regra e os docs do projeto:

- **Agent Review** – Revisa suas alterações antes de dar push (por commit), comparando com a branch principal. Ajuda a pegar bugs, erros de lógica e edge cases.
  - Ative em: **Settings** do Cursor → procure por “Agent” / “Background Agents” (ou na integração com GitHub).
  - Para alinhar ao nosso critério (PRD, Arquiteto, Backend), depois do Agent Review use também a **regra** e os **@ dos docs** no Chat (ver seção 2).

- **BugBot** – Revisa Pull Requests no GitHub (bugs, performance, segurança) e pode sugerir correções (BugBot Autofix).
  - Conecte o GitHub: [Cursor Dashboard](https://cursor.com/dashboard) → integração com GitHub (permissão de escrita nos repositórios).
  - Ative o BugBot/Autofix: [Cursor Dashboard → Bugbot](https://cursor.com/dashboard?tab=bugbot).
  - O BugBot não usa sozinho o nosso PRD/refinamento/agents; para um review **alinhado aos agentes e ao PRD**, continue usando a **regra + @ docs** no Chat (seção 2) ou o **prompt** da seção 3.

- **AI Review (Beta)** – Em versões recentes (0.31.1+), há recurso de “AI Review” que analisa arquivos modificados em PRs. Use em conjunto com a regra e os documentos para garantir aderência ao contrato e à arquitetura.

### 1.2 Extensões que ajudam (instalar no Cursor)

O Cursor usa o **Open VSX Registry** (e suporta extensões em formato VSIX). Você pode instalar:

1. **Abrir o painel de extensões no Cursor**  
   `Cmd+Shift+X` (macOS) ou `Ctrl+Shift+X` (Windows/Linux), ou menu **View → Extensions**.

2. **Extensões úteis para PR e review**
   - **GitHub Pull Requests and Issues** – Se estiver disponível no Cursor/Open VSX, permite abrir e listar PRs direto no editor e ver o diff. Assim você consegue pedir no Chat: “revise as alterações deste PR” com a regra e os @ dos docs.
   - **GitLens** – Histórico e diff no código; ajuda a ver o que mudou na branch e colar no prompt de review se precisar.
   - **CursorCommands** (comunidade) – Repositório [AlexZaccaria/CursorCommands](https://github.com/AlexZaccaria/CursorCommands); automatiza fluxos com o Cursor (incluindo review de PR). Verifique no GitHub se há comando de “PR review” e se está publicado no Open VSX ou como VSIX.

3. **Como instalar uma extensão**
   - No painel **Extensions**, busque pelo nome (ex.: “GitHub Pull Requests”, “GitLens”).
   - Se não aparecer (algumas são só do marketplace da Microsoft), é possível instalar por **VSIX**: baixe o `.vsix` do [VS Code Marketplace](https://marketplace.visualstudio.com/) e no Cursor use **Cmd+Shift+P** / **Ctrl+Shift+P** → “Extensions: Install from VSIX…” e selecione o arquivo.

**Resumo:** Use os recursos nativos (Agent Review, BugBot, AI Review) para análise geral e bugs; use a **regra do repositório + @ dos docs** no Chat para um review que siga exatamente o Arquiteto, o Backend e o PRD/refinamento.

---

## 2. Uso imediato (manual)

### Opção A – Cursor com a regra do repositório (recomendado)

1. A regra de code review está em **`.cursor/rules/code-review-pr.mdc`**. Ela é aplicável a arquivos `**/*.ts`, `**/*.prisma`, `**/package.json`.
2. Depois de abrir um PR (ou de dar checkout na branch do PR):
   - Abra o **Chat** do Cursor e mencione a regra, por exemplo:
     - *“Use a regra de code review de PR e revise as alterações desta branch em relação à main.”*
   - Ou abra os arquivos alterados pelo PR e peça:
     - *“Faça o code review destes arquivos seguindo @.cursor/rules/code-review-pr.mdc e os docs @objective.md, @PRD/prd-001-auth-onboarding-metas.md, @refinamentos técnicos/refinamento-tecnico-001-auth-onboarding-metas.md, @agents/backend.md e @agents/arquiteto-software.md.”*
3. A IA usará o checklist da regra (contratos, arquitetura, multi-tenancy, segurança, produto, tamanho do PR, **verificação em tempo de execução e dependências**) e responderá com **Resumo**, **Checklist**, **Sugestões** e **Rastreabilidade**.
4. **Recomendado antes de aprovar:** rodar localmente `npm run build` e `npm run start:dev` no backend (ou o equivalente no escopo do PR) e confirmar que a aplicação sobe sem erro. Isso evita que falhas como `UnknownExportException` (Nest) ou `PrismaClientInitializationError` (Prisma 7) passem só no merge.

### Opção B – Prompt em qualquer LLM (Copilot, ChatGPT, Claude, etc.)

1. Cole o **prompt completo** da seção 2 abaixo.
2. Substitua `[COLE AQUI O DIFF DO PR OU DESCRIÇÃO DAS ALTERAÇÕES]` pelo diff do PR (ex.: `git diff main...feature/auth-signup-login`) ou por uma descrição objetiva dos arquivos e mudanças.
3. Envie. Use a resposta como parecer de review (Arquiteto + Backend + aderência ao PRD/PM).

---

## 3. Prompt completo para code review (copiar e colar)

```
Você é o revisor de um Pull Request deste repositório. Atue como **Arquiteto de Software** e **Agente Backend** ao mesmo tempo, usando estritamente as fontes abaixo como critério.

**Fontes obrigatórias (use como verdade):**
- objective.md: app Android, API reutilizável/whitelabel, login, onboarding, plano semanal, 3 abas (Perfil, Treino, Alimentação).
- PRD/prd-001-auth-onboarding-metas.md: REQ-*, NFR-*, SCN-*, ERD, OpenAPI, dicionário de dados.
- refinamentos técnicos/refinamento-tecnico-001-auth-onboarding-metas.md: instruções Backend/DBA, endpoints, DTOs, multi-tenancy, soft delete, rate limiting (5 falhas → 429, 15 min bloqueio).
- agents/arquiteto-software.md: contratos imutáveis, módulos por domínio, sem @Global(), manifesto de diretórios.
- agents/backend.md: controllers sem regra de negócio, Argon2id, JWT (tenant_id, sub, roles, exp), tenant_id e deleted_at em operações.

**Alterações do PR a revisar:**
[COLE AQUI O DIFF DO PR OU DESCRIÇÃO DAS ALTERAÇÕES]

**Instruções:**
1. Verifique aderência aos contratos OpenAPI (paths, métodos, status codes, DTOs).
2. Verifique organização: módulos por domínio, controller só orquestra, service com lógica, sem @Global().
3. Verifique multi-tenancy (tenant_id), soft delete (deleted_at), Argon2id para senha, JWT com sub/tenant_id/roles/exp, e proteção força bruta (5 falhas → 429, 15 min).
4. Verifique se o comportamento atende aos REQ-* e SCN-* citados no PR.
5. **Verificação em tempo de execução:** Se possível, execute `npm run build` e `npm run start:dev` no backend (ou peça ao autor que confirme). A aplicação deve subir sem erro (ex.: UnknownExportException, PrismaClientInitializationError). Se não puder rodar, indique no review que o autor deve confirmar que a app sobe.
6. **Dependências críticas:** Para Prisma (ou outro ORM/DB), confira se a instanciação do cliente está de acordo com a versão major (ex.: Prisma 7 exige adapter no construtor do PrismaClient; url não fica no schema). Consulte o guia de upgrade da lib quando o package.json indicar versão major relevante.
7. Indique: Aprovado / Aprovado com ressalvas / Alterações necessárias; liste itens ❌ com arquivo/trecho e sugestão; liste REQ-* e SCN-* cobertos.
8. Não invente requisitos; em caso de omissão nos docs, peça clarificação.
```

Substitua apenas o bloco `[COLE AQUI ...]` pelo conteúdo do PR (diff ou descrição).

---

## 4. Como obter o diff do PR (para colar no prompt)

No repositório local, na pasta do projeto:

```bash
# Troque feature/auth-signup-login pelo nome da branch do PR
git diff main...feature/auth-signup-login
```

Copie a saída e cole no lugar de `[COLE AQUI O DIFF DO PR OU DESCRIÇÃO DAS ALTERAÇÕES]`.

---

## 5. Instruções para solicitar um Deep Research

Se quiser **estudar ou automatizar** o code review por IA (ex.: rodar em todo PR no GitHub), use o texto abaixo como **brief para um deep research** (pesquisa aprofundada ou tarefa para um agente de pesquisa).

### Título sugerido do Deep Research

**“Automatizar code review por IA em Pull Requests usando regras do projeto (agents, PRD, refinamento)”**

### Objetivo

Definir e comparar formas de **executar code review por IA** sempre que um Pull Request for aberto (ou atualizado), usando como critério de revisão:

- Documentos do repositório: `objective.md`, PRD (ex.: `prd-001-auth-onboarding-metas.md`), refinamento técnico (ex.: `refinamento-tecnico-001-auth-onboarding-metas.md`).
- Definições dos agentes: `agents/arquiteto-software.md`, `agents/backend.md` (e, se aplicável, `agents/product-manager.md`, `agents/dba.md`).
- Fluxo de trabalho: `agents/dev-workflow.md` (review pelo Arquiteto e pelo PM antes do merge).

### Perguntas a responder no Deep Research

1. **GitHub**
   - Como usar **GitHub Actions** para, ao abrir/atualizar um PR, obter o diff e enviar para um modelo de linguagem (OpenAI, Anthropic, etc.) com um prompt que inclua os artefatos acima?
   - Quais ações ou exemplos públicos já fazem “AI code review” em PRs e permitem prompt customizado ou upload de contexto (markdown/docs)?
   - Como evitar vazamento de código em logs e como tratar secrets (API keys) de forma segura?

2. **Cursor / IDE**
   - Como usar **Cursor Rules** (ou equivalente) para que, ao mencionar “code review deste PR”, a IA carregue automaticamente os arquivos de agentes e os docs (objective, PRD, refinamento)?
   - É possível disparar um “code review” a partir de um comando ou atalho que já injete a branch/base do PR?

3. **Outras integrações**
   - **MCP (Model Context Protocol)** ou ferramentas que leiam PR/diff e um conjunto de arquivos de contexto (agents + PRD + refinamento) e chamem um LLM para devolver um comentário de review.
   - **Bots no GitHub** (ex.: comentar no PR com o resultado do review) que aceitem regras de review em markdown ou YAML no repositório.

4. **Formato do resultado**
   - Padronizar o formato da resposta da IA (ex.: checklist + Resumo + Rastreabilidade REQ-*/SCN-*) para ser postado como comentário no PR ou como resumo em documento.

### Entregáveis esperados do Deep Research

- Comparativo de **pelo menos 3 abordagens** (ex.: GitHub Action + API LLM, Cursor Rule + fluxo manual, bot/MCP).
- Passo a passo mínimo para implementar a abordagem recomendada neste repositório (incluindo onde colocar o prompt e os artefatos de contexto).
- Riscos e cuidados (custo de API, tamanho do contexto, segurança dos secrets, não commitar tokens).

Use este brief em uma ferramenta de “deep research” ou como tarefa para um agente que pesquise e documente as opções antes de implementar a automação.

---

## 6. Verificação em tempo de execução (obrigatória antes de aprovar)

Para evitar que erros que só aparecem ao subir a aplicação passem no review:

- **Quem revisa:** sempre que o PR alterar o backend, execute na pasta do backend:
  - `npm run build`
  - `npm run start:dev` (ou `npm start` se o banco já estiver configurado)
- A aplicação deve subir sem exceções (ex.: Nest `UnknownExportException`, Prisma `PrismaClientInitializationError`).
- Se o revisor não puder rodar (ex.: ambiente sem banco), o **autor do PR** deve confirmar na descrição ou em comentário que rodou build + start e que a app sobe.
- Para stacks com ORM (ex.: Prisma), confira a **versão major** em `package.json` e o guia de upgrade (ex.: [Prisma v7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)): a instanciação do cliente (ex.: uso de adapter no Prisma 7) deve estar correta.

A regra em `.cursor/rules/code-review-pr.mdc` inclui o bloco **6. Verificação em tempo de execução e dependências** no checklist.

---

## 7. Resumo

| O que você quer | Onde / Como |
|-----------------|-------------|
| Revisar um PR agora (manual) | Cursor: use a regra `.cursor/rules/code-review-pr.mdc` e mencione os @ dos docs (seção 2). Ou copie o prompt da seção 3 e o diff da seção 4 em qualquer LLM. **Antes de aprovar:** rode build + start no backend (seção 6). |
| Padronizar o critério de review | A regra e o prompt já refletem Arquiteto + Backend + PRD/refinamento/objective + verificação em tempo de execução e dependências. |
| Automatizar review em todo PR | Use as **Instruções para Deep Research** (seção 5) para estudar GitHub Actions, Cursor, MCP ou bots e depois implementar. |
