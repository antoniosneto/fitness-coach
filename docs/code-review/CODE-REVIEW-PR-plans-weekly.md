# Code Review – PR: POST /plans/weekly e Motor de Metas

**Branch:** `feature/plans-weekly` → `main`  
**Data:** 2026-03-05  
**Fontes:** `objective.md`, PRD prd-001-auth-onboarding-metas.md, refinamento-tecnico-001-auth-onboarding-metas.md, agents/arquiteto-software.md, agents/backend.md, .cursor/rules/code-review-pr.mdc, docs/CODE-REVIEW-AI.md.

---

## 1. Resumo

**Aprovado com ressalvas.** O PR implementa POST /api/v1/plans/weekly e o Motor de Metas (GCT Mifflin-St Jeor, déficit por intensidade, sugestão TACO) em conformidade com o PRD e o refinamento. Contratos, arquitetura, multi-tenancy e soft delete estão respeitados. Ressalva não bloqueante: a estrutura de treino semanal (SCN-TRAIN-ROTINA-MAQUINAS) não foi implementada neste PR; o summary_json contém apenas daily_targets e suggested_meals (alimentação). O refinamento prevê treino em épico/versão futura.

---

## 2. Checklist

### 2.1 Contratos e PRD
- [x] **Endpoints e paths:** POST /api/v1/plans/weekly implementado conforme OpenAPI/PRD (operationId generateWeeklyPlan, security bearerAuth).
- [x] **Status codes:** 201 (plano gerado), 422 (dados de onboarding incompletos), 401 (não autenticado via JwtAuthGuard). PRD §4.
- [x] **DTOs:** Response com weekly_plan_id, start_date, end_date, target_kcal_per_day, summary (daily_targets, suggested_meals). Sem request body (usa dados do usuário autenticado). Contrato documentado em contratos-frontend.md.
- [x] Nenhum endpoint, campo ou tabela inventado fora do PRD/refinamento.

### 2.2 Arquitetura e organização (Arquiteto)
- [x] **Módulos por domínio:** PlanModule em `backend/src/modules/plan/`; sem `@Global()`.
- [x] **Controller apenas orquestra:** PlanController recebe user (JWT), chama planService.generateWeeklyPlan(userId, tenantId), retorna DTO. Nenhuma regra de negócio no controller.
- [x] **Service com lógica:** PlanService valida perfil/metas, chama GoalsMotorService, persiste WeeklyPlan; GoalsMotorService contém Mifflin-St Jeor, déficit, consulta Food (TACO).
- [x] **Injeção de dependência:** PrismaService e GoalsMotorService injetados; sem `new` de serviços de domínio.
- [x] **Estrutura de pastas:** `backend/src/modules/plan/` (plan.module.ts, plan.controller.ts, plan.service.ts, services/goals-motor.service.ts, dto/). Conforme manifesto do Arquiteto.

### 2.3 Multi-tenancy e segurança (Backend + NFRs)
- [x] **tenant_id:** PlanService filtra UserProfile e BodyCompositionGoal por `user: { tenantId, deletedAt: null }`. Criação de WeeklyPlan com userId e tenantId do JWT. GoalsMotorService.suggestDailyMeals filtra Food por tenantId.
- [x] **Soft delete:** Consultas a UserProfile e BodyCompositionGoal usam `deletedAt: null` no user e na entidade. WeeklyPlan criado sem deleted_at (registro novo).
- [x] Auth não alterada neste PR (Argon2id, JWT, rate limiting permanecem no AuthModule).
- [x] **JWT:** Rota protegida com JwtAuthGuard; usa @CurrentUser() com userId e tenantId. Sem PII extra no payload.
- [x] Rate limiting/força bruta permanecem no login; Plans não altera.

### 2.4 Produto e comportamento (PM / PRD)
- [x] **REQ-GOAL-002:** Déficit de 20% para intensidade `medium` aplicado em GoalsMotorService (DEFICIT_PERCENT.medium = 0.2).
- [x] **REQ-GOAL-003:** Consulta à tabela TACO (Food) para sugestão de refeições com foco em proteína (orderBy proteinG desc, acúmulo até target).
- [x] **SCN-GOAL-METAS-MEDIUM:** GCT por Mifflin-St Jeor (PRD §7), déficit 20%, uso de TACO refletidos no código. Validação de taxa 1,5% já existia no Onboarding (defineGoals); o plano usa a meta já validada.
- [x] **422 onboarding incompleto:** PlanService lança UnprocessableEntityException quando perfil ou meta ausentes, ou peso/altura nulos. Mensagem clara para o usuário.
- [ ] **SCN-TRAIN-ROTINA-MAQUINAS:** Estrutura de treino semanal (dias, tipos de treino, preferência “apenas máquinas”) não implementada neste PR. Refinamento §3.5 prevê algoritmo mínimo de treino; o summary atual contém apenas daily_targets e suggested_meals. **Ressalva:** aceitável como primeiro incremento; treino pode ser evoluído em PR posterior.

### 2.5 Tamanho e fluxo
- [x] **PR dentro do limite:** Alterações em 7 arquivos (app.module, docs, Postman) + novo módulo plan/ (5 arquivos). Total estimado ~440 linhas (novos ~310, modificados ~130). Abaixo de ~500 linhas.
- [x] Descrição do PR deve mencionar PRD, refinamento, REQ-GOAL-002, REQ-GOAL-003, REQ-PLAN-001/002 (conforme sugerido no fluxo).

### 2.6 Verificação em tempo de execução e dependências
- [x] **Build:** `npm run build` executado no backend; concluído com sucesso (tsc).
- [x] **Start:** Autor confirmou que a aplicação sobe e que a rota POST /api/v1/plans/weekly responde após reiniciar o backend (201 com token e onboarding completo).
- [x] **Prisma:** Nenhuma alteração no PrismaService ou no schema neste PR; uso de Prisma 7 mantido (já validado em PRs anteriores).

---

## 3. Sugestões (não bloqueantes)

- **Cenário 422 no Postman:** Incluir um request “POST Plans Weekly (expect 422)” (ex.: usuário sem perfil ou sem metas, ou token sem onboarding completo) com script validando status 422 e corpo com `message` sobre onboarding incompleto.
- **Idade mínima:** GoalsMotorService.getAgeYears usa `Math.max(age, 18)`. Documentar no código ou em ADR a opção de idade mínima para o cálculo (evitar BMR irreal para datas de nascimento futuras ou muito jovens).
- **Estrutura de treino:** Em PR futuro, estender `summary_json` (ou DTO) com estrutura semanal de treino (dias, tipo de treino, preferências) conforme SCN-TRAIN-ROTINA-MAQUINAS.

---

## 4. Rastreabilidade

| Requisito / Cenário | Atendimento |
|---------------------|-------------|
| REQ-GOAL-002 (déficit 20% para medium) | ✅ GoalsMotorService: DEFICIT_PERCENT.medium = 0.2, targetKcal = gct * (1 - deficit). |
| REQ-GOAL-003 (uso da tabela TACO) | ✅ suggestDailyMeals consulta Food por tenantId, orderBy proteinG desc; retorno em summary.suggested_meals. |
| REQ-PLAN-001 (geração de rotina semanal com preferências) | ⚠️ Parcial: plano semanal criado (WeeklyPlan, período start_date/end_date); preferências de treino e estrutura de dias de treino não implementadas neste PR. |
| REQ-PLAN-002 (disponibilização em abas) | ✅ Contrato de resposta 201 com resumo; consumo pelas abas (frontend) fica para o app. |
| SCN-GOAL-METAS-MEDIUM | ✅ GCT Mifflin-St Jeor, déficit 20%, TACO para suprimento proteico. |
| SCN-TRAIN-ROTINA-MAQUINAS | ❌ Não implementado (treino semanal com dias e preferências); planejado para incremento futuro. |
| OpenAPI /api/v1/plans/weekly (201, 422) | ✅ Implementado e documentado. |

Conclusão: o PR atende aos requisitos de plano semanal (calorias, macros, TACO) e à validação de onboarding. A parte de treino semanal (dias, tipos, preferências) fica para evolução posterior, em linha com o refinamento.
