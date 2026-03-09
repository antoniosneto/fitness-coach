# Checklist – Fase 1 Frontend × dev-workflow

Conferência do fluxo `agents/dev-workflow.md` para a entrega **Frontend Auth (Fase 1)**.

---

## O que já foi feito

| # | Passo | Status |
|---|--------|--------|
| 1 | **Branch a partir da main** | ✅ `feature/frontend-auth-phase1` criada a partir de `main` |
| 2 | **Revisar solução com Arquiteto** | ✅ PLANO-FRONTEND-EPICO1.md, ADR-003, AGENTS.md; dúvidas resolvidas |
| 3 | **Desenvolvimento** | ✅ app/ com core (Dio, secure storage, API error), auth (modelos, API, providers), telas Login, Signup, Forgot-password, Reset-password, AuthGate, PlaceholderHome |
| 4 | **Testes da API (Postman)** | ⚪ N/A para este PR (frontend não altera endpoints); API já coberta pela collection existente |
| 5 | **Rodar testes** | ✅ App rodado (`flutter run -d chrome`); fluxos de auth testados manualmente |

---

## O que falta para fechar o fluxo

| # | Passo | Ação |
|---|--------|--------|
| 6 | **Code review** | Rodar review usando `.cursor/rules/code-review-pr.mdc` e `docs/CODE-REVIEW-AI.md`. Incluir no contexto: `@agents/frontend.md`, `@AGENTS.md`, `@docs/backend/contratos-frontend.md`, `@PRD/prd-001-auth-onboarding-metas.md`. A regra atual é voltada a Backend (.ts, .prisma); para Frontend, pedir no Chat: “Revise as alterações desta branch (app/ e backend/) seguindo docs/CODE-REVIEW-AI.md, agents/frontend.md, AGENTS.md e contratos-frontend.md.” |
| 7 | **Documentador do Backend** | **Só se o PR incluir alterações em `backend/`.** Nesta Fase 1 houve alterações no backend: (1) CORS em `main.ts`, (2) stub de e-mail em `adapters/console-mail-sender.service.ts` (log do link de reset em dev). Se esses commits entrarem no mesmo PR, acionar o **Agente Documentador** com: “**O que foi feito:** CORS habilitado no main.ts para o frontend web; stub de e-mail em dev passa a logar o link de reset no console. **Arquivos:** backend/src/main.ts, backend/src/modules/auth/adapters/console-mail-sender.service.ts. **Requisitos:** REQ-AUTH-003.” O Documentador atualiza `docs/backend/` (e CHANGELOG). Incluir as alterações de documentação no commit antes do PR. |
| 8 | **Commit e Pull Request** | Seguir `agents/git.md`: verificar `user.name` e `user.email`, Conventional Commits, **push após cada commit**, abrir PR para `main`. Na descrição: PRD, refinamento, REQ-AUTH-*, SCN-* (auth), tamanho (~500 linhas). Ver rascunho em `docs/PR-BODY-frontend-auth-phase1.md`. |
| 9 | **Revisão Arquiteto + PM** | Solicitar review do PR pelo Arquiteto e pelo PM; aplicar ajustes. |
| 10 | **Merge** | Merge na `main` somente após aprovação. |

---

## Resumo

- **Feito:** passos 1, 2, 3 e 5; passo 4 N/A (frontend).
- **Pendente:** 6 (code review), 7 (Documentador se backend no PR), 8 (commit + push + PR), 9 (review), 10 (merge).

Ordem sugerida: **6 → 7 (se aplicável) → 8 → 9 → 10**.
