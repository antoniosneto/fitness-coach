## Refinamento Técnico – Épico 1: Autenticação, Onboarding e Metas

Este documento é o **refinamento técnico** do épico 1 (`prd-001-auth-onboarding-metas.md`) e serve como **handoff detalhado** do Agente Arquiteto para os agentes:

- Agente **Backend** (NestJS + Prisma),
- Agente **Frontend** (Flutter + Riverpod + Freezed),
- Agente **DBA** (PostgreSQL + Prisma).

Todas as instruções aqui **devem respeitar**:

- o `objective.md` (app Android, API reutilizável/whitelabel, foco em dieta e treino semanais), e
- o `agents/arquiteto-software.md` (governança determinística, contratos estáveis, multi‑agentes).

---

## 1. Diretrizes Comuns aos Três Agentes

- **Contexto de produto**
  - App Android que ajuda o usuário a **definir e acompanhar dieta e treino semanais** com base em:
    - objetivos de composição corporal,
    - preferências alimentares,
    - preferências de treino/esportes.
  - Este épico entrega:
    - **autenticação** segura com JWT e multi‑tenant,
    - **onboarding** de perfil e metas,
    - **primeiro motor de metas** + geração do **primeiro plano semanal**.

- **Stack e contratos (não alterar sem ADR do Arquiteto)**
  - Backend:
    - Node.js + **NestJS**,
    - **Prisma** como ORM,
    - **JWT** para autenticação,
    - **Argon2id** para hash de senha.
  - Frontend:
    - **Flutter**,
    - **Riverpod** para gerenciamento de estado,
    - **Freezed** para modelos imutáveis e estados.
  - Banco:
    - **PostgreSQL** com foco em:
      - `tenant_id` em todas as tabelas de domínio,
      - *soft delete* para entidades de usuário/planos,
      - preparo para RLS (Row‑Level Security).

- **NFRs principais do PRD que todos devem respeitar**
  - Multi‑tenancy por `tenant_id` em todas as tabelas de domínio.
  - Soft delete com coluna `deleted_at` para `User`, `UserProfile`, `BodyCompositionGoal`, `WeeklyPlan`.
  - Hash de senhas com **Argon2id** (tempo de 200–500 ms em hardware de referência).
  - Autenticação **stateless** via JWT (sem PII desnecessário no payload).
  - Rate limiting e proteção contra força bruta em endpoints de login e recuperação de senha.

---

## 2. Instruções para o Agente DBA (PostgreSQL + Prisma)

### 2.1. Modelagem de Dados (conforme PRD + ERD)

Implementar, no schema Prisma, as entidades do PRD (seção 1 e ERD Mermaid), garantindo:

- **TENANT**
  - Campos mínimos:
    - `tenant_id` (UUID, PK),
    - `name` (string, obrigatório),
    - timestamps padrão (`created_at`, `updated_at`).
  - Deve ser entidade raiz para isolamento de dados.

- **USER**
  - Campos mínimos:
    - `user_id` (UUID, PK),
    - `tenant_id` (UUID, FK → `Tenant`),
    - `email` (string, único por tenant),
    - `password_hash` (string),
    - `deleted_at` (datetime, nullable),
    - timestamps padrão (`created_at`, `updated_at`).
  - Constraints:
    - `UNIQUE (tenant_id, email)`.
    - `tenant_id` obrigatório.
  - Política de deleção:
    - **Soft delete**: nunca remover fisicamente o registro; usar `deleted_at`.

- **USER_PROFILE**
  - Campos mínimos:
    - `user_profile_id` (UUID, PK),
    - `user_id` (UUID, FK → `User`),
    - `name` (string),
    - `sex` (string/enum, ex.: `male`, `female`, `other`),
    - `birth_date` (date),
    - `height_cm` (float),
    - opcional: `body_fat_percentage` (float, nullable),
    - opcional: `body_fat_visual_id` (string, nullable),
    - timestamps padrão.
  - Relação **1:1** com `User` (implementar constraint para um único profile por usuário).

- **BODY_COMPOSITION_GOAL**
  - Campos mínimos:
    - `goal_id` (UUID, PK),
    - `user_id` (UUID, FK → `User`),
    - `current_weight_kg` (float),
    - `current_body_fat_percent` (float),
    - `target_weight_kg` (float),
    - `target_body_fat_percent` (float),
    - `months_to_target` (int, ≥ 1),
    - `intensity` (string/enum: `light`, `medium`, `high`),
    - `deleted_at` (datetime, nullable),
    - timestamps padrão.
  - Relação N:1 com `User`.
  - Soft delete via `deleted_at`.

- **WEEKLY_PLAN**
  - Campos mínimos:
    - `weekly_plan_id` (UUID, PK),
    - `user_id` (UUID, FK → `User`),
    - `tenant_id` (UUID, FK → `Tenant`),
    - `start_date` (date),
    - `end_date` (date),
    - `summary_json` (JSON, opcional; para armazenar visão consolidada de treino+alimentação),
    - `deleted_at` (datetime, nullable),
    - timestamps padrão.
  - Relações:
    - N:1 com `User`,
    - N:1 com `Tenant`.
  - Soft delete via `deleted_at`.

- **FOOD (TACO)**
  - Campos mínimos:
    - `food_id` (UUID, PK),
    - `tenant_id` (UUID, FK → `Tenant`) – permitir um tenant “padrão” para seed global,
    - `description` (string),
    - `kcal` (float),
    - `protein_g` (float),
    - `carb_g` (float),
    - `fat_g` (float),
    - timestamps padrão.
  - Preparar índices em `tenant_id` + `description` para buscas eficientes pelo motor de metas.

- **AUTH_SESSION** (lógica)
  - Opcionalmente modelar tabela para auditoria de sessões, mesmo com JWT stateless, contendo:
    - `session_id` (UUID, PK),
    - `user_id` (FK),
    - `tenant_id` (FK),
    - `created_at`, `expires_at`,
    - `revoked_at` (para logout/banimentos futuros).

### 2.2. Multi‑Tenancy e Segurança

- Todas as tabelas de domínio ligadas ao usuário devem ter `tenant_id` direta ou indiretamente (pelo menos via `User`).
- Preparar o banco para **RLS**:
  - Criar políticas de exemplo/boilerplate filtrando por `tenant_id`.
  - Garantir que qualquer consulta padrão em views futuras possa ser facilmente protegida por RLS.

### 2.3. Soft Delete

- Adotar **soft delete** (via `deleted_at`) para:
  - `User`,
  - `UserProfile`,
  - `BodyCompositionGoal`,
  - `WeeklyPlan`.
- Fornecer **views ou filtros padrão** (via Prisma) que excluam registros com `deleted_at` não nulo em consultas comuns.

### 2.4. Migrações e Seed TACO

- Utilizar **`prisma migrate dev`** com migrações nomeadas e versionadas.
- Não utilizar `prisma db push` em ambientes compartilhados.
- Preparar um script de seed TACO:
  - inserir os alimentos base na tabela `FOOD`,
  - associar a um `tenant` padrão (ex.: `global`),
  - garantir que não haja dependência de APIs externas em produção (conforme PRD).

---

## 3. Instruções para o Agente Backend (NestJS + Prisma)

### 3.1. Organização de Módulos

Criar módulos por domínio:

- `AuthModule`
  - Responsável por:
    - `/api/v1/auth/signup`,
    - `/api/v1/auth/login`,
    - fluxo de recuperação de senha.
  - Componentes:
    - `AuthController`,
    - `AuthService`,
    - adaptadores de hashing (Argon2id) e JWT.

- `OnboardingModule`
  - Responsável por:
    - `/api/v1/onboarding/profile`,
    - `/api/v1/onboarding/goals`.
  - Componentes:
    - `OnboardingController`,
    - `OnboardingService`,
    - integração com repositórios de `UserProfile`, `BodyCompositionGoal`.

- `PlanModule`
  - Responsável por:
    - `/api/v1/plans/weekly` (geração do primeiro plano semanal).
  - Componentes:
    - `PlanController`,
    - `PlanService` (incluindo integração com Motor IA/algoritmo interno),
    - adaptadores para leitura de `FOOD`, metas e preferências.

### 3.2. Endpoints (alinhados ao PRD/OpenAPI)

Implementar os endpoints descritos na seção 4 do PRD:

- `POST /api/v1/auth/signup`
  - Recebe `{ email, password, name }`.
  - Cria `User` + `UserProfile` inicial, vinculados a um `tenant`.
  - Retornos:
    - `201` em sucesso,
    - `409` se email já utilizado no mesmo `tenant`.

- `POST /api/v1/auth/login`
  - Recebe `{ email, password }`.
  - Valida credenciais com `password_hash` em Argon2id.
  - Emite **JWT** contendo `tenant_id`, `sub` (user_id), `roles`, `exp`.
  - Aplica **rate limiting** + lógica de bloqueio de força bruta conforme `SCN-AUTH-BLOQUEIO-FALHAS`.

- `PUT /api/v1/onboarding/profile`
  - Autenticado (JWT obrigatório).
  - Atualiza `UserProfile` com:
    - nome, sexo, data de nascimento, peso atual, altura, `body_fat_percentage` ou `body_fat_visual_id`.
  - Se `body_fat_visual_id` vier preenchido, converter para valor numérico e persistir em `body_fat_percentage` (conforme `SCN-ONB-BIOTIPO-VISUAL`).

- `PUT /api/v1/onboarding/goals`
  - Autenticado (JWT).
  - Define meta de composição corporal (`BodyCompositionGoal`) com:
    - peso atual, % gordura atual, peso alvo, % gordura alvo, meses até a meta, intensidade.
  - Valida segurança fisiológica:
    - taxa de perda semanal ≤ 1.5% do peso corporal (conforme `REQ-GOAL-001` e `SCN-GOAL-METAS-MEDIUM`),
    - caso contrário, retornar `422`.

- `POST /api/v1/plans/weekly`
  - Autenticado (JWT).
  - Verifica se dados de onboarding (`UserProfile`, `BodyCompositionGoal` e preferências) estão completos; caso contrário, retorna `422`.
  - Chama Motor de Metas interno (ou serviço de IA) para:
    - calcular **déficit calórico** de 20% sobre GCT para intensidade `medium`,
    - consultar TACO (`FOOD`) para montar refeições,
    - montar estrutura de treino semanal conforme preferências (`SCN-TRAIN-ROTINA-MAQUINAS`).
  - Persiste `WeeklyPlan` e retorna `201` com resumo.

### 3.3. DTOs e Validação (class-validator)

Para cada endpoint, criar DTOs de entrada/saída alinhados ao OpenAPI:

- Usar `class-validator` e `class-transformer`:
  - `@IsEmail()` para email,
  - `@MinLength(8)` para senha,
  - `@IsEnum()` para campos de enum (`sex`, `intensity`),
  - `@IsDateString()` ou validação de data para `birth_date`,
  - `@IsNumber()` com limites coerentes para pesos, alturas e % gordura.
- Garantir que DTOs de saída reflitam exatamente os contratos de resposta (sem expor `password_hash` ou dados sensíveis).

### 3.4. Autenticação, Multi‑Tenancy e Segurança

- Implementar **guard JWT** que:
  - validador token,
  - extrai `tenant_id`, `sub` (user_id), `roles`,
  - injeta esses valores no contexto de request.
- Toda query Prisma deve:
  - filtrar por `tenant_id` e `user_id` quando apropriado,
  - ignorar registros com `deleted_at` não nulo por padrão.
- Implementar lógica de **rate limiting** para login e recuperação de senha:
  - seguir o requisito de bloquear após 5 tentativas falhas e retornar `429` na 6ª,
  - bloquear novas tentativas por 15 minutos para o par IP/email.

### 3.5. Motor de Metas (versão inicial)

- Implementar serviço de domínio responsável por:
  - Calcular **Gasto Calórico Total (GCT)** usando fórmula Mifflin‑St Jeor (conforme suposição atual).
  - Aplicar déficit de 20% para intensidade `medium` (`REQ-GOAL-002`).
  - Calcular taxa de perda semanal e validar limite de 1.5% (`REQ-GOAL-001`).
  - Consultar TACO (`FOOD`) para montar distribuição de macros, com foco em proteína.
- Para treino:
  - Implementar algoritmo mínimo que atenda `SCN-TRAIN-ROTINA-MAQUINAS`:
    - montar rotina com foco em membros superiores aos sábados,
    - treinos de pernas quinta e domingo,
    - descanso segunda, descanso ativo sexta,
    - excluir exercícios de peso livre das sugestões primárias quando usuária/o preferir “apenas máquinas”.

### 3.6. Testes (TDD/BDD)

- Criar testes automatizados cobrindo, no mínimo:
  - `SCN-AUTH-BLOQUEIO-FALHAS`,
  - `SCN-ONB-BIOTIPO-VISUAL`,
  - `SCN-GOAL-METAS-MEDIUM`,
  - `SCN-TRAIN-ROTINA-MAQUINAS`.
- Mapear cada cenário BDD em:
  - testes de integração/e2e (`*.spec.ts`) executados contra a API NestJS,
  - garantindo que asserções respeitem os contratos de status HTTP e efeitos em banco.

---

## 4. Instruções para o Agente Frontend (Flutter + Riverpod + Freezed)

### 4.1. Fluxos e Telas Prioritárias

Com base no `objective.md`, PRD e diagramas Mermaid:

- **Fluxo de Autenticação**
  - Tela de **Login**:
    - Campos: email, senha, link “Esqueci minha senha”.
    - Ações:
      - chamar `POST /api/v1/auth/login`,
      - lidar com erros 401 e 429 (mensagens claras ao usuário).
  - Tela de **Signup**:
    - Campos: email, senha, nome.
    - Ações:
      - chamar `POST /api/v1/auth/signup`,
      - tratar conflito 409 (email já utilizado).

- **Fluxo de Onboarding**
  - Passo 1 – **Dados básicos**:
    - nome, sexo, data de nascimento, peso atual, altura.
  - Passo 2 – **% gordura atual**:
    - opção “sei meu percentual” → input numérico,
    - opção “não sei” → galeria de imagens de biotipo (`body_fat_visual_id`) conforme PRD.
  - Passo 3 – **Metas e intensidade**:
    - peso alvo, % gordura alvo, prazo (em meses),
    - escolha de objetivo (perder gordura / ganhar massa / manter),
    - intensidade (`light`, `medium`, `high`).
  - Passo 4 – **Preferências de treino/esportes** (mínimo para atender `SCN-TRAIN-ROTINA-MAQUINAS`).

- **Plano semanal e abas** (esqueleto inicial)
  - Após a primeira geração bem‑sucedida do plano:
    - exibir navegação em 3 abas:
      - `Perfil` (dados e metas),
      - `Treino` (resumo do plano semanal de treino),
      - `Alimentação` (resumo do plano semanal de refeições – mesmo que simplificado neste épico).

### 4.2. Estado e Modelagem com Riverpod + Freezed

- Criar **providers** por feature:
  - `authProvider` / `authNotifier`:
    - estados: `Unauthenticated`, `Authenticating`, `Authenticated`, `AuthError`.
  - `onboardingProvider`:
    - estados: passos atuais, dados temporários do formulário, erros de validação.
  - `weeklyPlanProvider`:
    - estados: `Loading`, `Data`, `Error` para o plano semanal retornado pelo backend.

- Utilizar **Freezed** para:
  - modelos de domínio (usuário, perfil, meta, plano semanal),
  - estados das telas (uniões de tipos para `Loading`, `Data`, `Error`).
- Garantir que widgets consumidores:
  - usem `ConsumerWidget` ou `HookConsumerWidget`,
  - façam pattern matching de estados com `when`/`maybeWhen` (obrigando tratamento explícito de todos os estados).

### 4.3. Integração com a API

- Respeitar integralmente os contratos OpenAPI do PRD:
  - endpoints, formatos de payload e códigos de status.
- Implementar um cliente HTTP:
  - armazenar o JWT com segurança (respeitando boas práticas de Flutter/Android),
  - injetar o token em chamadas autenticadas (`Authorization: Bearer <token>`),
  - tratar respostas `401` (expiração de sessão), `422` (validação de metas), `429` (rate limiting).
- Para `SCN-ONB-BIOTIPO-VISUAL`:
  - enviar o `body_fat_visual_id` correspondente à imagem selecionada,
  - não calcular nada no frontend; delegar o cálculo/atribuição numérica para o backend.

### 4.4. UX e Performance

- Cumprir NFRs de UX:
  - manter o fluxo de onboarding fluido (transições < 200ms P95),
  - minimizar i/o desnecessário (agrupar chamadas sempre que possível, sem quebrar contratos).
- Implementar feedback claro:
  - loaders para requisições em andamento,
  - mensagens para erros de rede e validação de back.

---

## 5. Conclusão e Critério de Pronto

O épico 1 é considerado **tecnicamente pronto** quando:

- O **DBA**:
  - tiver o schema Prisma e o banco PostgreSQL alinhados ao ERD do PRD,
  - tiver configurado soft delete e preparado o seed TACO,
  - tiver migrações versionadas, sem uso destrutivo de `db push`.

- O **Backend**:
  - expuser todos os endpoints descritos no PRD,
  - aplicasse autenticação JWT, multi‑tenancy por `tenant_id`, rate limiting e Argon2id,
  - implementasse o motor de metas inicial atendendo `SCN-GOAL-METAS-MEDIUM` e `SCN-TRAIN-ROTINA-MAQUINAS`,
  - tivesse testes cobrindo os cenários BDD principais.

- O **Frontend**:
  - implementasse o fluxo de login/signup + onboarding completo (dados básicos, % gordura, metas, preferências),
  - integrasse com os endpoints configurados,
  - exibisse as três abas (`Perfil`, `Treino`, `Alimentação`) após a geração do primeiro plano semanal,
  - utilizasse Riverpod + Freezed para todos os estados de tela relevantes.

Somente quando esses três eixos estiverem atendidos, o épico 1 cumpre o `objective.md` para a fundação de autenticação, onboarding inteligente e motor de metas semanal.