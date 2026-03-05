# Code Review – PR: Onboarding profile e goals + JWT Guard

**Branch:** `feature/onboarding-profile-goals` → `main`  
**Data:** 2026-03-04  
**Fontes:** `objective.md`, PRD prd-001-auth-onboarding-metas.md, refinamento-tecnico-001-auth-onboarding-metas.md, agents/arquiteto-software.md, agents/backend.md, .cursor/rules/code-review-pr.mdc, docs/CODE-REVIEW-AI.md.

---

## 1. Resumo

**Aprovado com ressalvas.** O PR atende aos contratos OpenAPI, à organização por domínio, a multi-tenancy, soft delete, JWT e à validação REQ-GOAL-001 e SCN-ONB-BIOTIPO-VISUAL. Uma ressalva não bloqueante: considerar documentar ou padronizar o mapeamento `body_fat_visual_id` → percentual (ex.: ADR ou constante exportada) para alinhamento com o frontend.

---

## 2. Checklist

### 2.1 Contratos e PRD
- [x] Endpoints, métodos e paths coincidem com o OpenAPI/PRD: `PUT /api/v1/onboarding/profile`, `PUT /api/v1/onboarding/goals`.
- [x] Status codes: 200 (profile/goals), 400 (validação), 401 (não autenticado), 404 (perfil não encontrado), 422 (meta insegura). PRD não exige 404 para profile; documentação e comportamento estão consistentes.
- [x] DTOs alinhados ao PRD: `name`, `sex`, `birth_date`, `weight_kg`, `height_cm`, `body_fat_percentage`, `body_fat_visual_id` (profile); `current_weight_kg`, `current_body_fat_percent`, `target_*`, `months_to_target`, `intensity` (goals). Validações com class-validator (`@IsEnum`, `@IsDateString`, `@Min`, `@Max`, `@IsOptional`).
- [x] Nenhum endpoint ou campo inventado fora do PRD/refinamento.

### 2.2 Arquitetura e organização (Arquiteto)
- [x] Módulos por domínio: AuthModule, OnboardingModule; sem `@Global()`.
- [x] Controller apenas orquestra: recebe request, chama service, retorna; sem regra de negócio no controller.
- [x] Service contém a lógica (atualização de perfil, conversão body_fat_visual_id, validação 1,5%, criação de goal); acesso a dados via PrismaService.
- [x] Dependências via injeção (NestJS); sem `new` de serviços de domínio.
- [x] Estrutura de pastas: `backend/src/modules/auth` (strategies, guards, decorators), `backend/src/modules/onboarding`, `backend/prisma/schema.prisma`.

### 2.3 Multi-tenancy e segurança (Backend + NFRs)
- [x] Operações conscientes de `tenant_id`: profile é buscado/atualizado com `user: { tenantId, deletedAt: null }` e `deletedAt: null` no profile.
- [x] Soft delete respeitado: `findFirst` em User e UserProfile filtra `deletedAt: null`. BodyCompositionGoal não é listado/atualizado com filtro de soft delete neste PR (apenas criação); entidade possui `deleted_at` para uso futuro.
- [x] Argon2id já utilizado no Auth (sem alteração neste PR).
- [x] JWT com `sub`, `tenant_id`, `roles`, `exp`; strategy injeta `userId`, `tenantId`, `roles` no request; sem PII extra no payload.
- [x] Rate limiting/força bruta permanecem no login (REQ-AUTH-002); onboarding não altera.

### 2.4 Produto e comportamento (PM / PRD)
- [x] PUT profile: atualiza UserProfile com nome, sexo, data de nascimento, peso, altura, body_fat; se `body_fat_visual_id` enviado, converte e persiste em `body_fat_percentage` (SCN-ONB-BIOTIPO-VISUAL).
- [x] PUT goals: cria BodyCompositionGoal; valida taxa de perda ≤ 1,5% do peso/semana (REQ-GOAL-001); retorna 422 se inseguro.
- [x] Critérios do épico considerados (onboarding de perfil e metas, segurança da meta).
- [x] Sem impacto funcional não previsto.

### 2.5 Tamanho e fluxo
- [ ] PR dentro do limite de ~500 linhas: o diff inclui `package-lock.json`, o que infla bastante o número de linhas. **Sugestão:** considerar `.gitignore` para package-lock em projetos com lockfile opcional, ou aceitar que a contagem “útil” (src + prisma + docs) está dentro do espírito do limite.
- [x] Descrição do PR menciona PRD, refinamento e requisitos/cenários cobertos.

---

## 3. Sugestões (não bloqueantes)

1. **Mapeamento body_fat_visual_id:** O mapa `low/medium/high` e `biotype_*` está em função privada em `onboarding.service.ts`. Para alinhar frontend e futuras evoluções, considerar ADR ou constante exportada (ex.: `BODY_FAT_VISUAL_MAP`) documentada em `docs/backend` ou em contrato compartilhado.
2. **Metas anteriores:** Hoje cada PUT goals cria um novo BodyCompositionGoal (histórico). Se o produto exigir “apenas uma meta ativa”, considerar soft-delete das metas anteriores do usuário ao criar nova (com decisão explícita no PRD/refinamento).
3. **Testes:** O refinamento pede testes para SCN-ONB-BIOTIPO-VISUAL, SCN-GOAL-METAS-MEDIUM, etc. Incluir testes de integração/e2e em PRs futuros ou em um PR dedicado.

---

## 4. Rastreabilidade

| ID | Descrição | Atendimento |
|----|-----------|-------------|
| REQ-GOAL-001 | Taxa de perda ≤ 1,5% do peso/semana | ✅ Validado em `defineGoals`; 422 caso contrário. |
| SCN-ONB-BIOTIPO-VISUAL | body_fat_visual_id → valor numérico em body_fat_percentage | ✅ Função `bodyFatFromVisualId` e uso em `updateProfile`. |
| NFR-SEC-002 | JWT com tenant_id, sub, roles, exp | ✅ JwtStrategy e payload no login; guard protege rotas. |
| Refinamento 3.2 | PUT /onboarding/profile, PUT /onboarding/goals | ✅ Implementados com DTOs e status conforme OpenAPI. |
| Refinamento 3.4 | Guard JWT que extrai tenant_id, sub, roles e injeta no request | ✅ JwtAuthGuard + CurrentUser. |

---

*Review realizado conforme regra code-review-pr e docs/CODE-REVIEW-AI.md.*
