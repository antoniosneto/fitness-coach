# Modelo de Dados (Backend)

Fonte de verdade: **`backend/prisma/schema.prisma`**. Resumo para Frontend, DBA e Arquiteto.

---

## Convenções

- **IDs:** UUID (gerados pelo Prisma `@default(uuid())`).
- **Nomes de colunas no DB:** snake_case (ex.: `tenant_id`, `user_id`). No Prisma os campos são camelCase (ex.: `tenantId`, `userId`).
- **Soft delete:** Entidades com coluna `deleted_at`; registros com `deleted_at` não nulo são ignorados em consultas de uso normal.
- **Multi-tenancy:** Tabelas de domínio têm `tenant_id` (direto ou via relação com User).

---

## Entidades

### Tenant

- **Tabela:** `tenant` (PK: `tenant_id`).
- **Campos:** `tenant_id`, `name`, `created_at`, `updated_at`.
- **Uso:** Isolamento por marca/whitelabel; um tenant “default” é usado no signup quando não há outro definido.

### User

- **Tabela:** `users` (PK: `user_id`).
- **Campos:** `user_id`, `tenant_id` (FK → Tenant), `email`, `password_hash`, `deleted_at`, `created_at`, `updated_at`.
- **Constraint:** `UNIQUE (tenant_id, email)`.
- **Soft delete:** sim (`deleted_at`).

### UserProfile

- **Tabela:** `user_profiles` (PK: `user_profile_id`).
- **Campos:** `user_profile_id`, `user_id` (FK → User, único 1:1), `name`, `sex`, `birth_date`, `weight_kg` (opcional), `height_cm`, `body_fat_percentage`, `body_fat_visual_id`, `deleted_at`, `created_at`, `updated_at`.
- **Soft delete:** sim.

### BodyCompositionGoal

- **Tabela:** `body_composition_goals` (PK: `goal_id`).
- **Campos:** `goal_id`, `user_id` (FK → User), `current_weight_kg`, `current_body_fat_percent`, `target_weight_kg`, `target_body_fat_percent`, `months_to_target`, `intensity`, `deleted_at`, `created_at`, `updated_at`.
- **Soft delete:** sim.

### WeeklyPlan

- **Tabela:** `weekly_plans` (PK: `weekly_plan_id`).
- **Campos:** `weekly_plan_id`, `user_id`, `tenant_id`, `start_date`, `end_date`, `summary_json`, `deleted_at`, `created_at`, `updated_at`.
- **Soft delete:** sim.

### Food (TACO)

- **Tabela:** `foods` (PK: `food_id`).
- **Campos:** `food_id`, `tenant_id`, `description`, `kcal`, `protein_g`, `carb_g`, `fat_g`, `created_at`, `updated_at`.
- **Índice:** `(tenant_id, description)`.

### AuthSession

- **Tabela:** `auth_sessions` (PK: `session_id`).
- **Campos:** `session_id`, `user_id`, `tenant_id`, `created_at`, `expires_at`, `revoked_at`.
- **Uso:** Auditoria de sessões (JWT é stateless; esta tabela é opcional para revogação/auditoria).

---

## Relações resumidas

- **Tenant** 1:N User, 1:N WeeklyPlan, 1:N Food.
- **User** 1:1 UserProfile, 1:N BodyCompositionGoal, 1:N WeeklyPlan.
- **User** N:1 Tenant.

Qualquer alteração de schema deve ser feita via `prisma migrate dev` (nunca `db push` em ambientes compartilhados). DBA e Arquiteto definem o schema; o Backend apenas consome.
