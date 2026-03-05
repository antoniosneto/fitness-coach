# Ambiente e Contratos

## Banco de dados local (desenvolvimento e testes)

Para subir o PostgreSQL e aplicar o schema na máquina local:

1. **Subir o container** (na raiz do repositório):
   ```bash
   docker compose up -d
   ```
   Isso sobe o PostgreSQL 16 na porta 5432, com banco `fitness_coach`, usuário `fitness` e senha `fitness_local` (definidos em `docker-compose.yml`).

2. **Configurar o backend:** copie o exemplo de env e ajuste se precisar:
   ```bash
   cd backend
   cp .env.example .env
   ```
   O `.env.example` já vem com a `DATABASE_URL` compatível com o container.

3. **Aplicar migrações e gerar o cliente Prisma:**
   ```bash
   npx prisma migrate dev
   ```
   Na primeira vez, crie a migração inicial (ex.: nome `init`). O Prisma criará as tabelas e o cliente.

4. **Popular a tabela FOOD (seed TACO):**
   ```bash
   npm run db:seed
   ```
   ou `npx prisma db seed`. Insere alimentos base no tenant "default" (refinamento 2.4). Sem APIs externas. Se já houver alimentos no tenant, o seed não duplica.

5. **(Opcional)** Abrir o Prisma Studio para inspecionar dados:
   ```bash
   npx prisma studio
   ```

Para derrubar o banco: `docker compose down`. Para remover também o volume: `docker compose down -v`.

**Requisito:** Docker e Docker Compose instalados. **Se não usar Docker**, veja a seção *PostgreSQL via Homebrew* abaixo.

---

## PostgreSQL via Homebrew (Mac, sem Docker)

Se o Docker não estiver instalado, use o PostgreSQL nativo no Mac:

1. **Instalar e iniciar o PostgreSQL:**
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   ```
   Se o comando `psql` não for encontrado, adicione ao PATH (e depois rode `source ~/.zshrc`):
   ```bash
   echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
   ```

2. **Criar o banco** (o dono será seu usuário do Mac; não precisa de senha em localhost):
   ```bash
   createdb fitness_coach
   ```

3. **Configurar o backend:** em `backend/.env`, use uma destas opções.
   - **Opção A** – mesmo usuário do Mac (geralmente sem senha em localhost):
     ```env
     DATABASE_URL="postgresql://SEU_USUARIO@localhost:5432/fitness_coach?schema=public"
     ```
     Troque `SEU_USUARIO` pelo seu usuário (no terminal: `whoami`). Ex.: se for `antoniosneto`:
     ```env
     DATABASE_URL="postgresql://antoniosneto@localhost:5432/fitness_coach?schema=public"
     ```
   - **Opção B** – usuário `fitness` com senha (igual ao Docker): depois de criar o banco, no `psql postgres` rode:
     ```sql
     CREATE USER fitness WITH PASSWORD 'fitness_local';
     GRANT ALL PRIVILEGES ON DATABASE fitness_coach TO fitness;
     \c fitness_coach
     GRANT ALL ON SCHEMA public TO fitness;
     ```
     E no `.env`: `DATABASE_URL="postgresql://fitness:fitness_local@localhost:5432/fitness_coach?schema=public"`

4. **Aplicar migrações:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

5. **Popular a tabela FOOD (seed TACO):** `npm run db:seed` ou `npx prisma db seed`.

---

## Variáveis de ambiente

Definidas em `backend/.env` (não versionado). Exemplo em `backend/.env.example`:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| DATABASE_URL | sim | Connection string PostgreSQL (ex.: `postgresql://user:password@localhost:5432/fitness_coach?schema=public`). |
| JWT_SECRET | não (dev) | Secret para assinatura do JWT. Em produção deve ser definido e forte. Default em dev: `dev-secret-change-in-production`. |
| JWT_EXPIRES_IN | não | Expiração do JWT (ex.: `7d`). Implementação atual usa 604800 segundos (7 dias) fixo no código. |

## Contratos de referência

- **Frontend (request/response exatos):** `docs/backend/contratos-frontend.md` — formato do que enviar e do que receber por endpoint.
- **OpenAPI / PRD:** Endpoints e payloads do Épico 1 estão definidos em:
  - `PRD/prd-001-auth-onboarding-metas.md` (seção 4 – Contratos OpenAPI)
  - `refinamentos técnicos/refinamento-tecnico-001-auth-onboarding-metas.md`
- **Schema de dados:** `backend/prisma/schema.prisma`.
- **ADRs:** `docs/adr/` (ex.: ADR-001 para @types e Argon2id).

A documentação nesta pasta (`docs/backend/`) é mantida em cima do código e do schema atuais; em caso de divergência, o código e o Prisma são a fonte de verdade.
