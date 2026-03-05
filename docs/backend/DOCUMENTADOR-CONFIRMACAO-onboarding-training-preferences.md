# Confirmação do Documentador – PR feature/onboarding-training-preferences

**Chamado:** Passo 7 do dev-workflow (Documentador do Backend).  
**Referência:** `agents/documentador-backend.md`.

---

## Invocação

```
Documentador: atualize a documentação do backend.

**O que foi feito:** Preferências de treino (DD-ENT-TRAININGPREFERENCE): PUT /api/v1/onboarding/training-preferences com machines_only; modelo TrainingPreference (1:1 User); PlanService lê preferência e usa no plano semanal (summary.machines_only).
**Arquivos/módulos alterados:** backend/prisma/schema.prisma (TrainingPreference); backend/src/modules/onboarding/ (controller, service, dto); backend/src/modules/plan/plan.service.ts; docs/backend/; docs/postman/.
**Requisitos/cenários (opcional):** DD-ENT-TRAININGPREFERENCE, SCN-TRAIN-ROTINA-MAQUINAS.
```

---

## Confirmação

As alterações em `docs/backend/` (e Postman) já foram realizadas na mesma branch (feature/onboarding-training-preferences), em conjunto com o desenvolvimento:

| Arquivo | Alteração |
|---------|-----------|
| **contratos-frontend.md** | Seção 4.1: PUT /api/v1/onboarding/training-preferences — request body (`machines_only` boolean), respostas 200/400/401, nota sobre preferência opcional. |
| **api-endpoints.md** | Novo endpoint PUT /onboarding/training-preferences (path, body, resposta); lista de planejados atualizada (restando DD-ENT-SPORTPREFERENCE). |
| **README.md** | Estado atual: Onboarding inclui PUT training-preferences; pendentes atualizados (preferências de esportes). |
| **CHANGELOG.md** | Nova entrada: "2026-03-05 – Preferências de treino (DD-ENT-TRAININGPREFERENCE)". |

**Postman:** `docs/postman/Fitness-Coach-API-Epico1.postman_collection.json` — novo request "PUT Training Preferences" na pasta Onboarding (body `machines_only: true`, teste de status 200).

Nenhuma alteração adicional em `docs/backend/` é necessária para este PR. O Documentador confirma que a documentação está alinhada ao código atual e que a entrada no CHANGELOG foi registrada.

---

*Documentador do Backend – confirmação para o passo 7 do fluxo.*
