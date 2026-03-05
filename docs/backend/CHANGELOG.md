# Changelog – Documentação do Backend

Registro de atualizações feitas pelo **Agente Documentador** (`agents/documentador-backend.md`). Cada entrada corresponde a uma passagem do documentador após alteração no backend.

---

## 2026-03-05 – Recuperação de senha (REQ-AUTH-003)

- **Motivo:** Fluxo "Esqueci minha senha": POST /api/v1/auth/forgot-password e POST /api/v1/auth/reset-password. Token temporário (1 h), tabela PasswordResetToken, abstração de e-mail (ADR-002, stub em console), rate limit par IP+email (429). Contrato em CONTRATO-AUTH-RECUPERACAO-SENHA.md.
- **Arquivos alterados:** backend: AuthModule, AuthService, AuthController, DTOs, ports/mail-sender.interface, adapters/console-mail-sender.service; prisma: modelo PasswordResetToken; docs: contratos-frontend.md, api-endpoints.md, CHANGELOG.md; adr/ADR-002.
- **Requisitos/cenários:** REQ-AUTH-003.

---

## 2026-03-05 – Estrutura de treino semanal no plano (SCN-TRAIN-ROTINA-MAQUINAS)

- **Motivo:** Inclusão da rotina semanal de treino no summary do POST /api/v1/plans/weekly (REQ-PLAN-001, SCN-TRAIN-ROTINA-MAQUINAS). Segunda = descanso; quinta e domingo = pernas; sexta = descanso ativo; sábado = membros superiores; terça e quarta = treino genérico. Campo `machines_only` no summary para preferência “apenas máquinas” (preferência virá de onboarding quando existir).
- **Arquivos alterados:** backend: GoalsMotorService.buildWeeklyTrainingSchedule(), DTO weekly_training e machines_only; docs: contratos-frontend.md (exemplo 201), api-endpoints.md, CHANGELOG.md; Postman: teste de weekly_training e machines_only no POST Weekly.
- **Requisitos/cenários:** REQ-PLAN-001, SCN-TRAIN-ROTINA-MAQUINAS.

---

## 2026-03-05 – POST /plans/weekly e Motor de Metas

- **Motivo:** Implementação do PlanModule com endpoint POST /api/v1/plans/weekly (REQ-GOAL-002, REQ-GOAL-003, REQ-PLAN-001/002). Motor de Metas: GCT por Mifflin-St Jeor, déficit 20% para intensidade medium, sugestão de refeições via TACO (Food).
- **Arquivos de doc alterados:** api-endpoints.md (seção Plans), arquitetura.md (PlanModule, estrutura plan/), contratos-frontend.md (seção 5 – POST /plans/weekly), README.md (estado atual), CHANGELOG.md.
- **Requisitos/cenários:** REQ-GOAL-002 (déficit 20%), REQ-GOAL-003 (TACO), SCN-GOAL-METAS-MEDIUM. 422 quando onboarding incompleto.

---

## 2026-03-04 – Seed TACO (alimentos base)

- **Motivo:** Script de seed para popular a tabela FOOD (refinamento 2.4), associado ao tenant "default", sem APIs externas.
- **Arquivos:** `backend/prisma/seed.ts`, `backend/prisma.config.ts` (migrations.seed), `backend/package.json` (db:seed, ts-node), `docs/backend/ambiente-e-contratos.md`, CHANGELOG.md.
- **Uso:** `npm run db:seed` ou `npx prisma db seed` após migrações. Idempotente (não duplica se já houver alimentos no tenant).

---

## 2026-03-04 – Contratos Frontend + Estado atual e plano

- **Motivo:** Documentar tudo que foi avançado até aqui e garantir que o frontend tenha sempre documentado o formato de dados a enviar e a receber em cada endpoint.
- **Novo:** [contratos-frontend.md](contratos-frontend.md) — para cada endpoint: request body (JSON de exemplo e regras), response body por status (200, 201, 400, 401, 404, 409, 422, 429), formato padrão de erro NestJS.
- **Atualizado:** [api-endpoints.md](api-endpoints.md) — referência a contratos-frontend e exemplos de request/response resumidos; [README.md](README.md) — índice com contratos-frontend em destaque, seção "Como usar (sem contexto prévio)", **Estado atual do backend** e **Próximos passos (plano)**; [ambiente-e-contratos.md](ambiente-e-contratos.md) — link para contratos-frontend.
- **Convenção:** A partir desta passagem, toda alteração de endpoint deve ser refletida em `contratos-frontend.md` (o que o frontend envia e recebe).

---

## 2026-03-04 – Banco de dados local (Docker Compose)

- **Motivo:** Configuração do PostgreSQL local para desenvolvimento e testes: docker-compose na raiz do projeto, .env.example alinhado às credenciais do container, passos documentados em ambiente-e-contratos.md.
- **Arquivos:** docker-compose.yml (raiz), backend/.env.example, docs/backend/ambiente-e-contratos.md, docs/backend/README.md, CHANGELOG.md.

---

## 2026-03-04 – Documentação verificada após code review (PR onboarding)

- **Motivo:** Passagem do Agente Documentador após code review do PR *Onboarding profile e goals + JWT Guard*. Confirmação de que api-endpoints, modelo-dados e arquitetura refletem o estado atual do backend.
- **Arquivos de doc alterados:** CHANGELOG.md.
- **Code review:** resultado em `docs/code-review/CODE-REVIEW-PR-onboarding-profile-goals.md`.

---

## 2026-03-04 – Onboarding (profile e goals) + JWT Guard

- **Motivo:** Implementação dos endpoints PUT /onboarding/profile e PUT /onboarding/goals; JWT Strategy e JwtAuthGuard; campo weight_kg em UserProfile.
- **Arquivos de doc alterados:** api-endpoints.md, modelo-dados.md, arquitetura.md, CHANGELOG.md.
- **Requisitos/cenários:** REQ-GOAL-001 (taxa perda ≤ 1,5%/semana), SCN-ONB-BIOTIPO-VISUAL (body_fat_visual_id → body_fat_percentage).

---

## 2026-03-04 – Criação inicial da documentação

- **Motivo:** Criação do agente documentador e da estrutura `docs/backend/` para uso por Frontend, DBA e Arquiteto.
- **Arquivos criados:** README.md, arquitetura.md, api-endpoints.md, modelo-dados.md, ambiente-e-contratos.md, CHANGELOG.md.
- **Estado documentado:** NestJS 11, Prisma, PostgreSQL; módulo Auth (signup, login); JWT, Argon2id, proteção força bruta; modelo de dados Épico 1 (Tenant, User, UserProfile, BodyCompositionGoal, WeeklyPlan, Food, AuthSession).
