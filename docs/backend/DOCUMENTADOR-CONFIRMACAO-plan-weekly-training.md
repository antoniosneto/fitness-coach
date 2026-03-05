# Confirmação do Documentador – PR feature/plan-weekly-training

**Chamado:** Passo 7 do dev-workflow (Documentador do Backend).  
**Referência:** `agents/documentador-backend.md`.

---

## Invocação

```
Documentador: atualize a documentação do backend.

**O que foi feito:** Estrutura de treino semanal no plano (SCN-TRAIN-ROTINA-MAQUINAS): summary.weekly_training (7 dias) e summary.machines_only no POST /api/v1/plans/weekly.
**Arquivos/módulos alterados:** backend/src/modules/plan/ (dto, plan.service.ts, goals-motor.service.ts); docs/backend/; docs/postman/.
**Requisitos/cenários (opcional):** REQ-PLAN-001, SCN-TRAIN-ROTINA-MAQUINAS.
```

---

## Confirmação

As alterações em `docs/backend/` já foram realizadas na mesma branch (feature/plan-weekly-training), em conjunto com o desenvolvimento:

| Arquivo | Alteração |
|---------|-----------|
| **contratos-frontend.md** | Seção 5 (POST /plans/weekly): exemplo 201 atualizado com `weekly_training` e `machines_only`; descrição dos campos. |
| **api-endpoints.md** | Response 201 da seção Plans: inclusão de weekly_training e machines_only no body. |
| **README.md** | Estado atual: menção a estrutura de treino semanal e summary.weekly_training / machines_only. |
| **CHANGELOG.md** | Nova entrada: "2026-03-05 – Estrutura de treino semanal no plano (SCN-TRAIN-ROTINA-MAQUINAS)". |

**Postman:** `docs/postman/Fitness-Coach-API-Epico1.postman_collection.json` — testes do request "POST Weekly" atualizados para validar `summary.weekly_training` (array 7 itens) e `summary.machines_only` (boolean).

Nenhuma alteração adicional em `docs/backend/` é necessária para este PR. O Documentador confirma que a documentação está alinhada ao código atual e que a entrada no CHANGELOG foi registrada.

---

*Documentador do Backend – confirmação para o passo 7 do fluxo.*
