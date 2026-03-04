# Documentação do Backend – Fitness Coach API

Esta pasta contém a **documentação atual** do backend, pensada para que **Agente Frontend**, **Agente DBA** e **Agente Arquiteto** possam trabalhar **sem contexto prévio** do que já foi implementado.

---

## Índice

| Documento | Conteúdo | Para quem |
|-----------|----------|-----------|
| [arquitetura.md](arquitetura.md) | Stack, estrutura de pastas, módulos, convenções (multi-tenancy, soft delete, auth) | Arquiteto, Backend, DBA |
| [api-endpoints.md](api-endpoints.md) | Endpoints disponíveis: método, path, body, resposta, status | Frontend, Arquiteto |
| [modelo-dados.md](modelo-dados.md) | Entidades (tabelas), campos, relações, soft delete | DBA, Frontend, Arquiteto |
| [ambiente-e-contratos.md](ambiente-e-contratos.md) | Variáveis de ambiente, referência a OpenAPI/PRD | Todos, DevOps |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de atualizações desta documentação | Todos |

---

## Como usar

- **Frontend:** Use [api-endpoints.md](api-endpoints.md) para montar as chamadas HTTP e [modelo-dados.md](modelo-dados.md) para entender payloads e entidades.
- **DBA:** Use [modelo-dados.md](modelo-dados.md) e o schema em `backend/prisma/schema.prisma`; [arquitetura.md](arquitetura.md) descreve convenções (tenant_id, soft delete).
- **Arquiteto:** Use [arquitetura.md](arquitetura.md) e [api-endpoints.md](api-endpoints.md) para evoluir contratos e ADRs.

A documentação é mantida pelo **Agente Documentador** (`agents/documentador-backend.md`) a cada alteração no backend.
