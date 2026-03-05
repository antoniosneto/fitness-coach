# Documentação do Backend – Fitness Coach API

Esta pasta contém a **documentação atual** do backend, pensada para que **Agente Frontend**, **Agente DBA** e **Agente Arquiteto** possam trabalhar **sem contexto prévio** do que já foi implementado.

---

## Índice

| Documento | Conteúdo | Para quem |
|-----------|----------|-----------|
| [contratos-frontend.md](contratos-frontend.md) | **Formato exato de request e response** por endpoint (o que enviar e o que receber) | **Frontend** |
| [api-endpoints.md](api-endpoints.md) | Endpoints: método, path, body, resposta, status (resumo) | Frontend, Arquiteto |
| [arquitetura.md](arquitetura.md) | Stack, estrutura de pastas, módulos, convenções (multi-tenancy, soft delete, auth) | Arquiteto, Backend, DBA |
| [modelo-dados.md](modelo-dados.md) | Entidades (tabelas), campos, relações, soft delete | DBA, Frontend, Arquiteto |
| [ambiente-e-contratos.md](ambiente-e-contratos.md) | Variáveis de ambiente, **banco local (Docker/Homebrew)**, referência OpenAPI/PRD | Todos, DevOps |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de atualizações desta documentação | Todos |

Relatórios de **code review** de PRs que alteram o backend ficam em `docs/code-review/`.  
Collection **Postman** para testar os endpoints: `docs/postman/` (arquivo `Fitness-Coach-API-Epico1.postman_collection.json` e `README.md` com instruções).

---

## Como usar (sem contexto prévio)

- **Frontend:** Comece por **[contratos-frontend.md](contratos-frontend.md)** — lá estão o **body exato a enviar** e o **body exato recebido** (por status) para cada endpoint. Use em conjunto com [api-endpoints.md](api-endpoints.md) para paths e métodos e [modelo-dados.md](modelo-dados.md) para entidades.
- **DBA:** Use [modelo-dados.md](modelo-dados.md) e o schema em `backend/prisma/schema.prisma`; [arquitetura.md](arquitetura.md) descreve convenções (tenant_id, soft delete).
- **Arquiteto:** Use [arquitetura.md](arquitetura.md), [api-endpoints.md](api-endpoints.md) e [contratos-frontend.md](contratos-frontend.md) para evoluir contratos e ADRs.

---

## Estado atual do backend (Épico 1)

- **Implementado:** Auth (signup, login com JWT, Argon2id, proteção força bruta 5 falhas → 429), Onboarding (PUT profile, PUT goals com validação 1,5%/semana), **Plans** (POST /plans/weekly com Motor de Metas: GCT Mifflin-St Jeor, déficit por intensidade, sugestão TACO, estrutura de treino semanal SCN-TRAIN-ROTINA-MAQUINAS em `summary.weekly_training` e `summary.machines_only`), JWT Guard/Strategy, Prisma 7 com adapter pg, banco local (Docker ou Homebrew), seed TACO, collection Postman (incluindo POST Plans Weekly).
- **Documentado para o frontend:** Request/response de todos os endpoints em [contratos-frontend.md](contratos-frontend.md); erros 400/401/404/409/422/429 com formato padrão.
- **Pendente (próximos passos):** Estrutura de treino semanal no plano (SCN-TRAIN-ROTINA-MAQUINAS), preferências (treino/esporte) se definido no contrato, testes e2e dos SCN-*, recuperação de senha (REQ-AUTH-003).

A documentação é mantida pelo **Agente Documentador** (`agents/documentador-backend.md`) a cada alteração no backend.
