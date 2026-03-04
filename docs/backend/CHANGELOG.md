# Changelog – Documentação do Backend

Registro de atualizações feitas pelo **Agente Documentador** (`agents/documentador-backend.md`). Cada entrada corresponde a uma passagem do documentador após alteração no backend.

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
