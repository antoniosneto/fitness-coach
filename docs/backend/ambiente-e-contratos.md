# Ambiente e Contratos

## Variáveis de ambiente

Definidas em `backend/.env` (não versionado). Exemplo em `backend/.env.example`:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| DATABASE_URL | sim | Connection string PostgreSQL (ex.: `postgresql://user:password@localhost:5432/fitness_coach?schema=public`). |
| JWT_SECRET | não (dev) | Secret para assinatura do JWT. Em produção deve ser definido e forte. Default em dev: `dev-secret-change-in-production`. |
| JWT_EXPIRES_IN | não | Expiração do JWT (ex.: `7d`). Implementação atual usa 604800 segundos (7 dias) fixo no código. |

## Contratos de referência

- **OpenAPI / PRD:** Endpoints e payloads do Épico 1 estão definidos em:
  - `PRD/prd-001-auth-onboarding-metas.md` (seção 4 – Contratos OpenAPI)
  - `refinamentos técnicos/refinamento-tecnico-001-auth-onboarding-metas.md`
- **Schema de dados:** `backend/prisma/schema.prisma`.
- **ADRs:** `docs/adr/` (ex.: ADR-001 para @types e Argon2id).

A documentação nesta pasta (`docs/backend/`) é mantida em cima do código e do schema atuais; em caso de divergência, o código e o Prisma são a fonte de verdade.
