## Objetivo
Implementação dos endpoints de onboarding (perfil e metas) e proteção JWT para rotas autenticadas, conforme Épico 1.

**PRD:** `PRD/prd-001-auth-onboarding-metas.md`  
**Refinamento:** `refinamentos técnicos/refinamento-tecnico-001-auth-onboarding-metas.md`

## Alterações
- **Schema:** campo `weight_kg` em UserProfile
- **Auth:** JwtStrategy, JwtAuthGuard, decorator `@CurrentUser()`
- **OnboardingModule:**
  - `PUT /api/v1/onboarding/profile` — atualiza perfil; `body_fat_visual_id` → `body_fat_percentage` (SCN-ONB-BIOTIPO-VISUAL)
  - `PUT /api/v1/onboarding/goals` — define meta; valida taxa de perda ≤ 1,5%/semana (REQ-GOAL-001), retorna 422 se inseguro
- **docs/backend:** api-endpoints, modelo-dados, arquitetura, CHANGELOG

## Requisitos / Cenários
- REQ-GOAL-001 (taxa perda peso)
- SCN-ONB-BIOTIPO-VISUAL (conversão visual → % gordura)

## Tamanho
~500 linhas (código backend + docs); package-lock aumenta o diff total.

---
**Review:** Agente Arquiteto (`agents/arquiteto-software.md`) e Product Manager (`agents/product-manager.md`) conforme `agents/dev-workflow.md`.
