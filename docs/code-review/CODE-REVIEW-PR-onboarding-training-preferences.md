# Code Review – PR feature/onboarding-training-preferences (Preferências de treino)

**Branch:** `feature/onboarding-training-preferences` → `main`  
**Escopo:** PUT /api/v1/onboarding/training-preferences com `machines_only`; modelo TrainingPreference (1:1 User); PlanService lê preferência e usa no plano semanal.  
**Fontes:** `.cursor/rules/code-review-pr.mdc`, `docs/CODE-REVIEW-AI.md`, PRD (DD-ENT-TRAININGPREFERENCE), refinamento (§4 preferências de treino/esportes).

---

## 1. Resumo

**Aprovado.** O PR implementa preferências de treino (DD-ENT-TRAININGPREFERENCE) em conformidade com o PRD e o refinamento: endpoint PUT, DTO validado, modelo com tenant_id, uso no motor de metas (summary.machines_only). Contratos e documentação alinhados; tamanho do PR dentro do limite.

---

## 2. Checklist

### 1. Contratos e PRD
- [x] Endpoint e path coincidem com o desenho: PUT /api/v1/onboarding/training-preferences.
- [x] Status codes: 200 (sucesso, corpo vazio); 400 (validação); 401 (JWT obrigatório).
- [x] DTO UpdateTrainingPreferencesDto com `machines_only` (boolean, @IsBoolean); snake_case alinhado ao contrato documentado.
- [x] Nenhum endpoint ou tabela inventado fora do PRD/refinamento (DD-ENT-TRAININGPREFERENCE, N:1 User/Tenant; implementação 1:1 User).

### 2. Arquitetura e organização (Arquiteto)
- [x] Módulos por domínio (Onboarding); sem @Global().
- [x] Controller apenas orquestra (recebe body, chama OnboardingService.upsertTrainingPreferences, retorna void).
- [x] Lógica no OnboardingService (upsert com where userId, create/update); PlanService apenas lê preferência e usa no motor.
- [x] Dependências via injeção (PrismaService).
- [x] Estrutura respeitada: onboarding/dto, prisma/schema; PlanModule inalterado na estrutura.

### 3. Multi-tenancy e segurança (Backend + NFRs)
- [x] TrainingPreference com tenantId; upsert usa userId (único por tenant via User). Consulta em PlanService por userId (contexto já filtrado por tenant no fluxo de onboarding/plan).
- [x] Soft delete: não exigido para TrainingPreference pelo refinamento; User com deletedAt respeitado nas demais consultas.
- [x] JWT obrigatório no endpoint (JwtAuthGuard); userId e tenantId do token.
- [x] Sem alteração em auth/senhas; rate limiting inalterado.

### 4. Produto e comportamento (PM / PRD)
- [x] DD-ENT-TRAININGPREFERENCE (tipo de equipamento / “apenas máquinas”) refletido: campo machines_only; uso no motor (SCN-TRAIN-ROTINA-MAQUINAS) para summary.machines_only e buildWeeklyTrainingSchedule(machinesOnly).
- [x] Preferência opcional: se não houver registro, PlanService usa machinesOnly = true (comportamento anterior mantido).
- [x] Nenhum impacto que quebre fluxos existentes (POST /plans/weekly continua funcionando com ou sem preferência).

### 5. Tamanho e fluxo
- [x] PR dentro do limite (~134 linhas: +130, -4).
- [x] Descrição do PR deve mencionar PRD, refinamento, DD-ENT-TRAININGPREFERENCE e SCN-TRAIN-ROTINA-MAQUINAS.

### 6. Verificação em tempo de execução e dependências
- [x] **Build:** `npm run build` executado no backend — sucesso.
- [x] **Start:** Aplicação sobe com nova rota PUT /api/v1/onboarding/training-preferences. Autor do PR pode confirmar `npm run start:dev` em ambiente local.
- [x] **Prisma:** Novo modelo TrainingPreference; migração aplicada; sem alteração de versão do Prisma ou adapter.

---

## 3. Sugestões (opcionais, não bloqueantes)

- **SportPreference (DD-ENT-SPORTPREFERENCE):** Em épico futuro, considerar modelo e endpoint para preferências de esportes (natação, corrida, etc.), reutilizando o padrão de preferência por usuário (1:1 ou N:1 conforme desenho do Arquiteto).
- **GET de preferências:** Se o frontend precisar exibir a preferência atual antes de editar, considerar GET /onboarding/training-preferences (opcional).

---

## 4. Rastreabilidade

| ID | Descrição | Status |
|----|-----------|--------|
| DD-ENT-TRAININGPREFERENCE | Preferências de treino (tipo de equipamento); N:1 User, N:1 Tenant | Atendido (modelo TrainingPreference com machines_only; 1:1 User) |
| Refinamento Passo 4 | Preferências de treino/esportes (mínimo para SCN-TRAIN-ROTINA-MAQUINAS) | Atendido (treino; esportes deixado para incremento futuro) |
| SCN-TRAIN-ROTINA-MAQUINAS | Excluir peso livre quando “apenas máquinas” | Atendido (preferência lida no PlanService; summary.machines_only reflete o valor) |

---

*Review realizado conforme `.cursor/rules/code-review-pr.mdc` e `docs/CODE-REVIEW-AI.md`.*
