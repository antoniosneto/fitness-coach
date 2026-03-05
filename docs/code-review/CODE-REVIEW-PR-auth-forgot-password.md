# Code Review – PR feature/auth-forgot-password (Recuperação de senha REQ-AUTH-003)

**Branch:** `feature/auth-forgot-password` → `main`  
**Escopo:** Fluxo "Esqueci minha senha": POST /auth/forgot-password e POST /auth/reset-password; token temporário; abstração de e-mail (ADR-002); rate limit.  
**Fontes:** `.cursor/rules/code-review-pr.mdc`, `docs/CODE-REVIEW-AI.md`, PRD, refinamento, CONTRATO-AUTH-RECUPERACAO-SENHA.md, ADR-002.

---

## 1. Resumo

**Aprovado.** O PR implementa REQ-AUTH-003 em conformidade com o contrato e o ADR-002: endpoints e status corretos, DTOs validados, multi-tenancy e rate limiting aplicados, senha com Argon2id, provedor de e-mail desacoplado. Contratos e documentação alinhados.

---

## 2. Checklist

### 1. Contratos e PRD
- [x] Endpoints e paths coincidem com o contrato: POST /api/v1/auth/forgot-password e POST /api/v1/auth/reset-password.
- [x] Status codes: 200 para forgot-password e reset-password (sucesso); 400 para token inválido; 429 para rate limit (mensagem 15 min).
- [x] DTOs: ForgotPasswordDto (email com @IsEmail), ResetPasswordDto (token + new_password @MinLength(8)); batem com contratos-frontend.md.
- [x] Nenhum endpoint ou tabela inventado fora do PRD/refinamento/contrato (REQ-AUTH-003 e CONTRATO-AUTH-RECUPERACAO-SENHA.md).

### 2. Arquitetura e organização (Arquiteto)
- [x] Módulos por domínio (Auth); sem @Global().
- [x] Controller apenas orquestra (recebe body, chama AuthService, retorna void); nenhuma regra no controller.
- [x] Lógica no AuthService (forgotPassword, resetPassword, rate limit, token, e-mail); acesso a dados via Prisma.
- [x] Dependências via injeção (PrismaService, JwtService, MAIL_SENDER); interface IMailSender + ConsoleMailSenderService (ADR-002).
- [x] Estrutura respeitada: auth/ports, auth/adapters, auth/dto; prisma/schema.

### 3. Multi-tenancy e segurança (Backend + NFRs)
- [x] Operações com tenant_id: getOrCreateDefaultTenant(), User e PasswordResetToken filtrados por tenantId; token criado com tenantId.
- [x] Soft delete: User consultado com deletedAt: null em forgotPassword (e já em login/signup).
- [x] Nova senha com Argon2id (mesmos parâmetros do signup, NFR-SEC-001).
- [x] JWT inalterado; fluxo de recuperação não expõe PII no response (sempre 200 em forgot).
- [x] Rate limiting em forgot-password: par IP+email, 5 tentativas → 429; bloqueio 15 min (refinamento §3.4 e contrato).

### 4. Produto e comportamento (PM / PRD)
- [x] REQ-AUTH-003 refletido: envio de e-mail com token temporário, endpoint de redefinição; resposta 200 em forgot sem revelar existência do e-mail; token de 1 h, uso único (usedAt).
- [x] ADR-002 aplicado: abstração do provedor de e-mail; stub em dev; falha de envio não altera resposta ao usuário (apenas log).
- [x] Nenhum impacto que quebre fluxos ou contratos existentes (signup/login inalterados).

### 5. Tamanho e fluxo
- [x] PR dentro do limite (~295 linhas: +291, -4).
- [x] Descrição do PR deve mencionar PRD, refinamento, REQ-AUTH-003 e CONTRATO/ADR-002.

### 6. Verificação em tempo de execução e dependências
- [x] **Build:** `npm run build` executado no backend — sucesso.
- [x] **Start:** Aplicação sobe com as novas rotas mapeadas (POST /auth/forgot-password e /auth/reset-password). Autor do PR pode confirmar `npm run start:dev` em ambiente local.
- [x] **Prisma:** Schema com novo modelo PasswordResetToken; migração aplicada; Prisma 7 e adapter mantidos. Nenhuma nova dependência de runtime em package.json.

---

## 3. Sugestões (opcionais, não bloqueantes)

- **Expiração configurável:** Considerar `RESET_TOKEN_EXPIRY_HOURS` (ou minutos) em variável de ambiente, em vez de constante fixa, para facilitar testes e ajustes por ambiente.
- **Limpeza de tokens:** Em épico futuro, job ou rotina para apagar registros de `password_reset_tokens` com `expiresAt` antigo ou `usedAt` preenchido, para evitar crescimento indefinido da tabela.
- **Teste Postman reset:** O request "POST Reset Password" exige token do banco; opcionalmente documentar no README do Postman um one-liner (ex.: `psql` ou Prisma Studio) para obter o último token após chamar Forgot Password.

---

## 4. Rastreabilidade

| ID | Descrição | Status |
|----|-----------|--------|
| REQ-AUTH-003 | Recuperação de senha: "Esqueci minha senha", e-mail com token temporário, endpoint de redefinição | Atendido (forgot-password + reset-password, token 1 h, uso único, Argon2id) |
| NFR-SEC-003 / refinamento §3.4 | Rate limiting em endpoints de recuperação de senha | Atendido (par IP+email, 5 tentativas → 429, 15 min) |
| ADR-002 | Provedor de e-mail desacoplado (interface + stub) | Atendido (IMailSender, ConsoleMailSenderService) |
| SCN-AUTH-RECUPERACAO | Cenário BDD (a ser detalhado no PRD) | Comportamento implementado; cenário pode ser formalizado depois |

---

*Review realizado conforme `.cursor/rules/code-review-pr.mdc` e `docs/CODE-REVIEW-AI.md`.*
