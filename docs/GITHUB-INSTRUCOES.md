# Instruções – GitHub (repositório e PRs)

Siga estes passos para subir o projeto para o GitHub e abrir Pull Requests.

---

## 1. Criar o repositório no GitHub

1. Acesse [github.com/new](https://github.com/new).
2. **Repository name:** por exemplo `fitness-coach` ou `test-multiagents`.
3. **Descrição (opcional):** "App dieta e treino semanal – desenvolvimento multi-agentes".
4. Escolha **Public** (ou Private, se preferir).
5. **Não** marque "Add a README file", "Add .gitignore" nem "Choose a license" (o projeto já tem conteúdo local).
6. Clique em **Create repository**.

---

## 2. Conectar o repositório local ao GitHub

No terminal, na pasta do projeto:

```bash
cd /caminho/para/test-multiagents

# Adicionar o remote (troque YOUR_USER e REPO pelo seu usuário e nome do repositório)
git remote add origin https://github.com/YOUR_USER/REPO.git

# Ou com SSH:
# git remote add origin git@github.com:YOUR_USER/REPO.git
```

---

## 3. Enviar as branches para o GitHub

```bash
# Enviar a branch principal (base para os PRs)
git push -u origin main

# Enviar a branch de feature (entrega atual)
git push -u origin feature/backend-prisma-schema-integration
```

Se o GitHub mostrar que a branch padrão é `master`, você pode renomear no GitHub em **Settings → General → Default branch** para `main`, ou usar `master` no lugar de `main` nos comandos.

---

## 4. Abrir o Pull Request

1. No GitHub, abra o repositório.
2. Deve aparecer um banner **"feature/backend-prisma-schema-integration had recent pushes"** com o botão **Compare & pull request**. Clique nele.  
   Ou: vá em **Pull requests → New pull request**.
3. **Base:** `main` ← **Compare:** `feature/backend-prisma-schema-integration`.
4. **Título sugerido:**  
   `[Backend] Épico 1 – Schema Prisma e integração NestJS (1ª entrega)`
5. **Descrição (cole no corpo do PR):**

```markdown
## PRD e refinamento
- **PRD:** [prd-001-auth-onboarding-metas.md](PRD/prd-001-auth-onboarding-metas.md)
- **Refinamento:** [refinamento-tecnico-001-auth-onboarding-metas.md](refinamentos%20técnicos/refinamento-tecnico-001-auth-onboarding-metas.md)

## Escopo
- Schema Prisma: Tenant, User, UserProfile, BodyCompositionGoal, WeeklyPlan, Food, AuthSession (conforme ERD e refinamento §2).
- Soft delete em User, UserProfile, BodyCompositionGoal, WeeklyPlan.
- Integração NestJS: PrismaModule e PrismaService (sem `@Global()`); AppModule importa PrismaModule.
- Config Prisma 7: `prisma.config.ts` + `DATABASE_URL`.
- Fluxo de trabalho documentado em `agents/dev-workflow.md`.

## Rastreabilidade
- Base para REQ-AUTH-*, REQ-ONB-*, REQ-GOAL-*, REQ-PLAN-*.
- NFR-ARCH-001 (tenant_id), NFR-ARCH-002 (soft delete).

## Code review
- **@agents/arquiteto-software** – Revisão técnica: contratos (schema), módulos, multi-tenancy, soft delete.
- **@agents/product-manager** – Revisão de produto: aderência ao PRD e critérios de sucesso do Épico 1.
```

6. Clique em **Create pull request**.

---

## 5. Depois do code review

- Quando o **Arquiteto** e o **Product Manager** aprovarem (ou você aplicar os ajustes combinados), faça o **Merge** do PR no GitHub (botão **Merge pull request**).
- Na sua máquina, atualize a `main` local:
  ```bash
  git checkout main
  git pull origin main
  ```

---

## 6. Próximas entregas (fluxo correto)

Para o próximo PR ter **diff visível** e seguir o fluxo do [dev-workflow](agents/dev-workflow.md):

1. Atualize a base e crie a branch **antes** de codar:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/nome-da-entrega
   ```
2. Implemente e teste (mantenha o PR ≤ ~500 linhas).
3. Commit e push:
   ```bash
   git add .
   git commit -m "feat(escopo): descrição"
   git push -u origin feature/nome-da-entrega
   ```
4. No GitHub: **Pull requests → New pull request** (base: `main`, compare: `feature/nome-da-entrega`), preencha título e descrição e peça review ao Arquiteto e ao PM.

---

## Resumo rápido

| Ação | Onde |
|------|------|
| Criar repositório | GitHub → New repository (sem README) |
| Conectar local | `git remote add origin https://github.com/USER/REPO.git` |
| Subir branches | `git push -u origin main` e `git push -u origin feature/...` |
| Abrir PR | GitHub → Pull requests → New (base: main, compare: feature) |
| Pedir review | Incluir no corpo do PR menção a Arquiteto e PM |
| Merge | Após aprovação → Merge pull request |
| Atualizar local | `git checkout main && git pull origin main` |
