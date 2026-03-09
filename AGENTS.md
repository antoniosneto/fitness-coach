# AGENTS.md – Manifesto para Agentes (Runbook)

Este documento é o **manifesto técnico** do projeto, definido em alinhamento entre **Agente Arquiteto**, **Agente Product Manager**, **Agente Backend** e **Agente Frontend**. Ele estabelece onde cada agente atua, com quais dependências, em quais diretórios e sob quais regras. Qualquer alteração estrutural (novas libs, nova árvore de pastas, novos papéis) deve passar por **ADR** ou atualização deste manifesto aprovada pelo **Agente Arquiteto**.

**Referências obrigatórias:** `objective.md`, `agents/arquiteto-software.md`, `agents/dev-workflow.md`, PRDs em `PRD/`, refinamentos em `refinamentos técnicos/`, ADRs em `docs/adr/`.

---

## 1. Pinagem de dependências

### 1.1 Regra geral

- **Agentes executores (DBA, Backend, Frontend) não podem adicionar bibliotecas** sem decisão registrada em **ADR** ou atualização deste `AGENTS.md` pelo Arquiteto.
- Recomenda-se **versões fixas** (sem `^` ou `~`) em produção; em desenvolvimento as versões abaixo servem como **referência mínima** e podem ser fixadas em CI ou por política do Arquiteto.

### 1.2 Backend (Node.js 24+ / NestJS 11 / Prisma 7)

- **Runtime:** Node.js 24+
- **Framework e core:** NestJS 11 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` 11.x), Prisma 7 (`prisma`, `@prisma/client`, `@prisma/adapter-pg` 7.x), `pg` 8.x.
- **Auth e validação:** `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`; `argon2` (Argon2id, NFR-SEC-001); `class-validator`, `class-transformer`.
- **Utilitários:** `dotenv`, `reflect-metadata`, `rxjs`.
- Dependências de **tipagem** (`@types/*`) para libs já aprovadas não exigem ADR individual (ver ADR-001). Novas dependências de **runtime** exigem ADR.

### 1.3 Frontend (Flutter / Dart)

- **SDK:** Flutter (versão estável alinhada ao canal oficial; mínimo para Android 16 / API 29+ conforme NFRs).
- **Estado e modelos:** Riverpod 3.x, Freezed, `freezed_annotation`, `build_runner`, `json_serializable` (modelos imutáveis e geração de código).
- **Rede e armazenamento:** Dio (cliente HTTP), `flutter_secure_storage` (JWT e credenciais; nunca SharedPreferences para dados sensíveis).
- **UI:** Material 3; uso de `ConsumerWidget` ou `HookConsumerWidget` com `WidgetRef`; nenhuma dependência não aprovada neste manifesto ou em ADR.
- O projeto Flutter deve residir no diretório definido na seção 2.2 (ex.: `app/`). Nenhuma lib fora desta lista sem ADR.

---

## 2. Manifesto de diretórios

### 2.1 Backend (`/backend`)

Estrutura **obrigatória**. Arquivos criados fora desta árvore são considerados fora do padrão e sujeitos a correção em code review.

```
backend/
├── prisma/
│   ├── schema.prisma         # Fonte de verdade para DBA; alterações via migrate
│   └── migrations/           # Migrações versionadas (prisma migrate dev)
├── src/
│   ├── main.ts               # Bootstrap: prefixo /api/v1, ValidationPipe
│   ├── app.module.ts         # Imports dos módulos (sem @Global())
│   ├── prisma/               # PrismaModule, PrismaService
│   ├── core/                 # Utilitários compartilhados (filters, interceptors, utils)
│   └── modules/             # Módulos por domínio (um módulo por pasta)
│       ├── auth/             # AuthModule: signup, login, forgot-password, reset-password
│       ├── onboarding/      # OnboardingModule: profile, goals
│       └── plan/             # PlanModule: plans/weekly (Motor de Metas)
├── .env.example
└── package.json
```

- Cada módulo sob `src/modules/<nome>/` contém: `*.module.ts`, `*.controller.ts`, `*.service.ts`, pasta `dto/` e, quando aplicável, `strategies/`, `guards/`, `decorators/`, subpastas `services/`.
- **Nenhum** arquivo de lógica de domínio ou HTTP fora de `src/` e `prisma/`.

### 2.2 Frontend (app Flutter)

Estrutura **obrigatória** assim que o projeto Flutter for criado. O diretório raiz do app é **`app/`** (nome do pacote e convenções de import ficam a cargo do Arquiteto em ADR se necessário).

```
app/
├── lib/
│   ├── main.dart
│   ├── app.dart              # MaterialApp / roteamento
│   ├── core/                 # Config, rede, storage, interceptors, erros
│   ├── features/             # Uma pasta por feature (não por tipo de arquivo)
│   │   ├── auth/             # Login, signup, forgot-password, reset-password
│   │   ├── onboarding/       # Passos 1–4 (perfil, % gordura, metas, preferências)
│   │   └── plans/            # Plano semanal, abas Perfil / Treino / Alimentação
│   └── shared/               # Design system, widgets comuns, loading/erro
├── pubspec.yaml
└── ...
```

- **Core:** cliente HTTP (Dio), armazenamento seguro, interceptors (Bearer), mapeamento de erros (401, 409, 422, 429).
- **Features:** por feature: modelos (Freezed), repositórios/API, providers (Riverpod), UI (telas e widgets). UI apenas consome estado; sem regra de negócio em widgets.
- **Shared:** componentes reutilizáveis, temas, textos comuns. Nenhum arquivo de regra de negócio ou chamada direta à API.

---

## 3. Regras de injeção e módulos (NestJS)

- **Proibido** uso de `@Global()` para módulos. Cada módulo é importado explicitamente onde for usado.
- Cada módulo deve declarar de forma explícita:
  - `imports`: outros módulos de que depende,
  - `providers`: serviços e adapters do próprio módulo,
  - `exports`: apenas o que outros módulos podem usar.
- Serviços compartilhados (ex.: PrismaService) são expostos **apenas** via `exports` e importados nos módulos que precisam.
- **Injeção de dependência:** instâncias de serviços **não** devem ser criadas com `new` na lógica de domínio ou em controllers; sempre via construtor e tokens do NestJS.
- Controllers apenas orquestram: recebem request, chamam service, retornam DTO. Services contêm a lógica de aplicação; acesso a dados via Prisma ou adapters/repositórios.

---

## 4. Papéis e limites por agente

### 4.1 Agente Product Manager (`agents/product-manager.md`)

- **Pode:** produzir PRDs técnicos no diretório `PRD/` com nomenclatura `prd-<EPIC_ID>-<slug>.md`; definir dicionário de dados, REQ-*, NFR-*, contratos OpenAPI (resumido), cenários BDD (SCN-*), diagramas Mermaid (ERD, stateDiagram, sequenceDiagram).
- **Não pode:** definir implementação (pastas, libs, código); referenciar DOM, seletores CSS ou detalhes de UI; alterar `AGENTS.md` ou ADRs.
- **Entradas:** regras de negócio, `objective.md`, dúvidas da equipe. **Saídas:** PRD e refinamento de alto nível (refinamento técnico detalhado é com o Arquiteto).

### 4.2 Agente Arquiteto de Software (`agents/arquiteto-software.md`)

- **Pode:** definir e atualizar `AGENTS.md`, ADRs, OpenAPI completo, Prisma Schema (em conjunto com DBA), diagramas C4, instruções por agente nos refinamentos técnicos; resolver conflitos entre PRD e implementação via ADR.
- **Não pode:** escrever código de regra de negócio; implementar endpoints, telas ou migrations.
- **Entradas:** PRD do PM, `objective.md`, ADRs e contratos existentes. **Saídas:** AGENTS.md (ou proposta), ADRs, refinamento técnico (instruções para DBA, Backend, Frontend), contratos (OpenAPI, schema, DTOs/Freezed quando gerados).

### 4.3 Agente DBA (PostgreSQL + Prisma)

- **Pode:** definir e evoluir o **Prisma Schema** em `backend/prisma/schema.prisma`; criar migrações com `prisma migrate dev` (nomeadas e versionadas); preparar seeds (ex.: TACO); documentar modelo em `docs/backend/modelo-dados.md` em conjunto com o Documentador.
- **Não pode:** usar `prisma db push` em ambientes compartilhados; criar tabelas/colunas fora do acordado no PRD e no refinamento; implementar lógica de aplicação no Backend.
- **Entradas:** PRD (dicionário de dados, ERD), refinamento técnico (seção DBA), decisões do Arquiteto (ADRs, schema existente).

### 4.4 Agente Backend (`agents/backend.md`)

- **Pode:** implementar em NestJS os módulos, controllers, services, DTOs e testes conforme PRD, refinamento, OpenAPI e Prisma Schema; usar apenas dependências aprovadas neste manifesto ou em ADR.
- **Não pode:** alterar contratos OpenAPI, Prisma Schema ou `AGENTS.md` por conta própria; criar endpoints ou campos não especificados no PRD/refinamento/OpenAPI; adicionar libs sem ADR; desabilitar auth, multi-tenancy ou soft delete para testes.
- **Entradas:** PRD, refinamento técnico (seção Backend), `AGENTS.md`, ADRs, OpenAPI, `docs/backend/` (arquitetura, modelo-dados). **Após alterações em `backend/`:** acionar o **Agente Documentador** para atualizar `docs/backend/` (ver `agents/dev-workflow.md` passo 7).

### 4.5 Agente Frontend (`agents/frontend.md`)

- **Pode:** implementar em Flutter (Riverpod + Freezed) todas as telas, fluxos e integrações com a API definidas no PRD e no refinamento; derivar modelos Freezed de `docs/backend/contratos-frontend.md` quando o Arquiteto não entregar artefatos; usar apenas dependências aprovadas neste manifesto ou em ADR.
- **Não pode:** inventar endpoints ou campos de payload; alterar contratos OpenAPI ou modelos Freezed já definidos pelo Arquiteto; usar StatefulWidget para regra de negócio ou setState para estado global; armazenar JWT/senha em SharedPreferences ou texto plano; adicionar libs sem ADR.
- **Entradas:** PRD, refinamento técnico (seção Frontend), `AGENTS.md`, ADRs, `docs/backend/contratos-frontend.md` e `api-endpoints.md`, modelos Freezed quando fornecidos pelo Arquiteto.
- **Após alterações em `app/`:** acionar o **Agente Documentador do Frontend** para atualizar `docs/frontend/` (ver `agents/documentador-frontend.md` e `agents/dev-workflow.md`).

### 4.6 Agente Documentador do Backend (`agents/documentador-backend.md`)

- **Pode:** ler o código e o schema em `backend/` e atualizar **apenas** a documentação em `docs/backend/` (README, arquitetura, api-endpoints, modelo-dados, ambiente-e-contratos, **contratos-frontend.md**, CHANGELOG). Não inventar endpoints ou entidades que não existam no código.
- **Não pode:** alterar código do backend ou do frontend; alterar Prisma Schema; definir contratos novos (isso é com Arquiteto/Backend).
- **Quando é acionado:** sempre que houver commit ou alteração em `backend/` ou `backend/prisma/`. O Backend (ou o desenvolvedor) chama o Documentador com resumo do que foi feito (formato em `agents/dev-workflow.md` passo 7).

### 4.7 Agente Documentador do Frontend (`agents/documentador-frontend.md`)

- **Pode:** ler o código em `app/` e atualizar **apenas** a documentação em `docs/frontend/` (README, arquitetura, telas-e-fluxos, modelos-e-estado, ambiente-e-contratos, CHANGELOG). Não inventar telas, rotas ou providers que não existam no código.
- **Não pode:** alterar código do frontend ou do backend; definir contratos novos (isso é com Arquiteto/Backend).
- **Quando é acionado:** sempre que houver commit ou alteração em `app/`. O Frontend (ou o desenvolvedor) chama o Documentador com resumo do que foi feito (formato em `agents/documentador-frontend.md`).

### 4.8 Agente Git (`agents/git.md`)

- **Pode:** executar commit, push e abertura de PR; verificar e solicitar configuração de `user.name` e `user.email` antes de qualquer commit; garantir mensagens no padrão Conventional Commits e que não haja arquivos sensíveis no stage.
- **Não pode:** alterar código, documentação de produto ou arquitetura; decidir escopo de PR (isso segue o dev-workflow e o planejamento dos outros agentes).
- **Quando é acionado:** no passo 8 do fluxo (Commit e Pull Request) ou quando o usuário pedir commit, push ou abertura de PR.

---

## 5. Ordem de atuação e artefatos por agente

| Ordem | Agente        | O que lê antes de agir | O que produz / onde atua |
|-------|----------------|-------------------------|---------------------------|
| 1     | Product Manager | `objective.md`, regras de negócio | PRD em `PRD/` (REQ-*, NFR-*, SCN-*, OpenAPI resumido, diagramas) |
| 2     | Arquiteto      | PRD, `objective.md`, `AGENTS.md` e ADRs existentes | Refinamento técnico, `AGENTS.md`, ADRs, OpenAPI completo, instruções DBA/Backend/Frontend |
| 3     | DBA            | PRD, refinamento (seção DBA), schema existente | `backend/prisma/schema.prisma`, migrações, seeds, contribuição a `docs/backend/modelo-dados.md` |
| 4     | Backend        | PRD, refinamento (Backend), `AGENTS.md`, ADRs, OpenAPI, `docs/backend/` | Código em `backend/`; ao commitar, aciona Documentador |
| 5     | Documentador Backend  | Descrição da alteração + código em `backend/` | Atualização de `docs/backend/` e CHANGELOG |
| 6     | Frontend       | PRD, refinamento (Frontend), `AGENTS.md`, ADRs, `docs/backend/contratos-frontend.md` | Código em `app/` (Flutter); ao commitar, aciona Documentador Frontend |
| 7     | Documentador Frontend | Descrição da alteração + código em `app/` | Atualização de `docs/frontend/` e CHANGELOG |
| 8     | Git            | Pedido de commit/PR, branch e arquivos alterados | Commit, push, link do PR |

- **Code review:** PRs são revisados pelo **Arquiteto** e pelo **Product Manager** antes do merge (ver `agents/dev-workflow.md`).
- **Fluxo completo de entrega:** ver **`agents/dev-workflow.md`** (branch, revisão com Arquiteto, desenvolvimento, Postman, code review, Documentador, commit, PR, revisão Arquiteto+PM, merge). Tamanho máximo de PR: ~500 linhas (adições + remoções).

---

## 6. Resumo de convenções compartilhadas

- **Contratos:** OpenAPI e `docs/backend/contratos-frontend.md` são a referência para request/response. Nenhum agente altera contratos sem ciclo de decisão do Arquiteto (ADR ou atualização de PRD/refinamento).
- **Multi-tenancy:** Todas as tabelas de domínio possuem `tenant_id`; operações filtram por tenant. Backend e DBA respeitam isso no schema e nas queries.
- **Soft delete:** Entidades sensíveis (User, UserProfile, BodyCompositionGoal, WeeklyPlan) usam `deleted_at`; consultas normais ignoram registros com `deleted_at` preenchido.
- **Autenticação:** JWT stateless (claims: `sub`, `tenant_id`, `roles`, `exp`). Senhas com Argon2id (NFR-SEC-001). No app: JWT apenas em armazenamento seguro (ex.: flutter_secure_storage).
- **NFRs:** Respeitar NFRs de segurança, performance e UX definidos no PRD (ex.: NFR-UX-001 P95 &lt; 200 ms em transições; rate limit e 429 conforme PRD).

---

*Última atualização: definido em conjunto por Arquiteto, PM, Backend e Frontend com base em `agents/*.md` e documentação em `docs/backend/`.*
