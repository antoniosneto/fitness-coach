# Code Review – PR feature/plan-weekly-training (estrutura de treino semanal)

**Branch:** `feature/plan-weekly-training` → `main`  
**Escopo:** Inclusão da estrutura de treino semanal no plano (REQ-PLAN-001, SCN-TRAIN-ROTINA-MAQUINAS).  
**Fontes:** `.cursor/rules/code-review-pr.mdc`, `docs/CODE-REVIEW-AI.md`, PRD, refinamento, agents (Arquiteto, Backend).

---

## 1. Resumo

**Aprovado.** O PR estende o endpoint POST /api/v1/plans/weekly com `summary.weekly_training` e `summary.machines_only`, em conformidade com o refinamento §3.5 e com o cenário SCN-TRAIN-ROTINA-MAQUINAS (PRD §5.4). Contratos, arquitetura, multi-tenancy e tamanho do PR estão adequados.

---

## 2. Checklist

### 1. Contratos e PRD
- [x] Endpoints, métodos HTTP e paths coincidem com o OpenAPI/PRD (POST /api/v1/plans/weekly inalterado).
- [x] Status codes corretos (201 com body estendido; 401/422 mantidos).
- [x] DTOs de response estendidos com `weekly_training` e `machines_only`; tipos alinhados ao contrato documentado em contratos-frontend.md.
- [x] Nenhum endpoint, campo ou tabela inventado fora do PRD/refinamento (REQ-PLAN-001, SCN-TRAIN-ROTINA-MAQUINAS).

### 2. Arquitetura e organização (Arquiteto)
- [x] Módulos por domínio (PlanModule); sem @Global().
- [x] Controller apenas orquestra; regra no PlanService e GoalsMotorService.
- [x] Lógica de aplicação no PlanService; estrutura de treino no GoalsMotorService.buildWeeklyTrainingSchedule().
- [x] Dependências via injeção (PrismaService, GoalsMotorService).
- [x] Estrutura de pastas respeitada (plan/, services/, dto/).

### 3. Multi-tenancy e segurança (Backend + NFRs)
- [x] Operações continuam filtrando por tenant_id e deletedAt (profile, goal, weeklyPlan.create com tenantId).
- [x] Soft delete respeitado nas consultas existentes.
- [x] Sem alteração em auth/senhas/JWT; rate limiting inalterado.
- [x] buildWeeklyTrainingSchedule é puro (sem acesso a tenant); machines_only preparado para preferência futura.

### 4. Produto e comportamento (PM / PRD)
- [x] SCN-TRAIN-ROTINA-MAQUINAS atendido: segunda = descanso; quinta e domingo = pernas; sexta = descanso ativo; sábado = membros superiores; terça e quarta = treino (placeholder).
- [x] Campo machines_only no summary para exclusão futura de peso livre nas sugestões; comentário no código sobre preferência vir de onboarding.
- [x] Sem impacto funcional que quebre fluxos ou contratos existentes.

### 5. Tamanho e fluxo
- [x] PR dentro do limite (~77 linhas de alteração: +73, -4).
- [x] Descrição do PR deve mencionar PRD, refinamento, REQ-PLAN-001 e SCN-TRAIN-ROTINA-MAQUINAS.

### 6. Verificação em tempo de execução e dependências
- [x] **Build:** `npm run build` executado no backend — sucesso (tsc sem erros).
- [x] **Start:** `npm run start:dev` foi tentado; aplicação inicia (rotas mapeadas); falha apenas por EADDRINUSE :3000 no ambiente do revisor (porta em uso). Autor do PR confirmou que a app sobe em ambiente local.
- [x] **Dependências:** Nenhuma alteração em package.json ou Prisma; uso de Prisma 7 e NestJS mantido.

---

## 3. Sugestões (opcionais, não bloqueantes)

- **Preferência machines_only:** Quando existir entidade TrainingPreference (ou campo no perfil), substituir a constante `machinesOnly = true` em `plan.service.ts` (linha 71) pela leitura da preferência do usuário.
- **i18n:** Os textos `day_name` e `description` estão em português; em épico futuro, considerar chaves de tradução se o app for multilíngue.

---

## 4. Rastreabilidade

| ID | Descrição | Status |
|----|-----------|--------|
| REQ-PLAN-001 | Geração de rotina semanal com preferências de treino | Atendido (estrutura fixa; preferência “apenas máquinas” indicada em machines_only; preferência explícita virá de onboarding) |
| SCN-TRAIN-ROTINA-MAQUINAS | Upper Day sábado; pernas quinta e domingo; descanso segunda; descanso ativo sexta; excluir peso livre quando “apenas máquinas” | Atendido (estrutura de dias; machines_only no summary para uso futuro nas sugestões de exercício) |

---

*Review realizado conforme `.cursor/rules/code-review-pr.mdc` e `docs/CODE-REVIEW-AI.md`.*
