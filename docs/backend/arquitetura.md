# Arquitetura do Backend

## Stack

- **Runtime:** Node.js 24+
- **Framework:** NestJS 11
- **ORM:** Prisma 7 (cliente instanciado com adapter `@prisma/adapter-pg`; ver `PrismaService`).
- **Banco:** PostgreSQL
- **Auth:** JWT stateless, senhas com Argon2id
- **Validação:** class-validator / class-transformer

## Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma      # Modelo de dados (fonte de verdade para DBA)
│   └── migrations/        # Migrações versionadas
├── src/
│   ├── main.ts            # Bootstrap: prefixo global api/v1, ValidationPipe
│   ├── app.module.ts      # Imports: PrismaModule, AuthModule, OnboardingModule
│   ├── prisma/            # PrismaModule, PrismaService (acesso ao DB)
│   ├── core/              # Utilitários compartilhados (ex.: request.util)
│   │   └── utils/
│   │       └── request.util.ts   # getClientIp(req) para rate limiting
│   └── modules/           # Módulos por domínio
│       ├── auth/          # AuthModule: signup, login, JWT Strategy/Guard
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/jwt.strategy.ts
│       │   ├── guards/jwt-auth.guard.ts
│       │   ├── decorators/current-user.decorator.ts
│       │   └── dto/
│       ├── onboarding/    # OnboardingModule: profile, goals
│       │   ├── onboarding.module.ts
│       │   ├── onboarding.controller.ts
│       │   ├── onboarding.service.ts
│       │   └── dto/
│       └── plan/          # PlanModule: plano semanal (Motor de Metas)
│           ├── plan.module.ts
│           ├── plan.controller.ts
│           ├── plan.service.ts
│           ├── services/goals-motor.service.ts
│           └── dto/
├── .env.example
└── package.json
```

## Módulos atuais

| Módulo | Responsabilidade | Rotas (prefixo base: /api/v1) |
|--------|------------------|--------------------------------|
| PrismaModule | Conexão ao DB, PrismaService | — |
| AuthModule | Cadastro, login, JWT, Strategy/Guard, proteção força bruta | /auth/signup, /auth/login |
| OnboardingModule | Perfil biométrico e metas de composição corporal | /onboarding/profile, /onboarding/goals |
| PlanModule | Plano semanal, Motor de Metas (GCT, déficit, TACO) | /plans/weekly |

- **Sem @Global():** Módulos compartilhados são importados onde forem usados (ex.: AuthModule importa PrismaModule).
- **Controllers** apenas orquestram (recebem request, chamam service, retornam DTO).
- **Services** contêm a lógica de aplicação e acessam dados via PrismaService.

## Convenções

- **Multi-tenancy:** Todas as operações de domínio são conscientes de `tenant_id`. Usuários e entidades são filtrados por tenant (e, onde aplicável, por `deleted_at`).
- **Soft delete:** Entidades User, UserProfile, BodyCompositionGoal, WeeklyPlan usam coluna `deleted_at`. Consultas normais ignoram registros com `deleted_at` preenchido.
- **Autenticação:** Rotas protegidas usam `JwtAuthGuard` e exigem header `Authorization: Bearer <JWT>`. O JWT contém `sub` (user_id), `tenant_id`, `roles`, `exp`. O contexto do request recebe `user: { userId, tenantId, roles }` (via `@CurrentUser()`).
- **Rate limiting / força bruta:** Login (e futuramente recuperação de senha) bloqueia após 5 tentativas falhas por par IP+email, retornando 429 por 15 minutos.

## Referências

- PRD: `PRD/prd-001-auth-onboarding-metas.md`
- Refinamento: `refinamentos técnicos/refinamento-tecnico-001-auth-onboarding-metas.md`
- ADRs: `docs/adr/`
