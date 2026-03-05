# Contrato – Recuperação de senha (REQ-AUTH-003)

**Para validação do Arquiteto.**  
**Referências:** PRD §2.1 (REQ-AUTH-003), refinamento §3.1 (fluxo recuperação de senha), NFR-SEC-003 (rate limiting).

---

## 1. Fluxo resumido

1. Usuário informa e-mail na tela “Esqueci minha senha”.
2. Frontend chama `POST /api/v1/auth/forgot-password` com `{ "email": "..." }`.
3. Backend: se o e-mail existir no tenant, gera token temporário, persiste com expiração (ex.: 1 h), envia e-mail com link contendo o token. Resposta **sempre 200** (não revelar se o e-mail existe).
4. Usuário clica no link (ex.: `myapp://reset-password?token=...` ou tela web com `?token=...`).
5. Frontend chama `POST /api/v1/auth/reset-password` com `{ "token": "...", "new_password": "..." }`.
6. Backend valida token (existência, não expirado, não usado), atualiza `password_hash` com Argon2id, invalida o token; retorna 200. Caso contrário, 400.

---

## 2. Endpoints (contrato OpenAPI-style)

### 2.1. POST /api/v1/auth/forgot-password

**Autenticação:** não exigida.

**Request body:**

| Campo | Tipo   | Obrigatório | Descrição |
|-------|--------|-------------|-----------|
| email | string | sim         | E-mail do usuário (formato válido) |

**Respostas:**

| Código | Descrição |
|--------|-----------|
| 200    | Sempre 200. Corpo: `{}` ou `{ "message": "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha." }`. Não indicar se o e-mail existe ou não. |
| 400    | Payload inválido (ex.: e-mail inválido). |
| 429    | Rate limiting: mesmo critério do login (ex.: muitas requisições por IP/email); retornar após limite. |

**Rate limiting:** Aplicar proteção semelhante ao login (refinamento §3.4): limite por par IP + email; 429 ao exceder; bloqueio temporário (ex.: 15 min) para evitar abuso.

---

### 2.2. POST /api/v1/auth/reset-password

**Autenticação:** não exigida.

**Request body:**

| Campo        | Tipo   | Obrigatório | Descrição |
|--------------|--------|-------------|-----------|
| token        | string | sim         | Token recebido por e-mail (UUID ou string opaca). |
| new_password | string | sim         | Nova senha (mínimo 8 caracteres; mesmas regras do signup). |

**Respostas:**

| Código | Descrição |
|--------|-----------|
| 200    | Senha alterada. Corpo vazio ou `{ "message": "Senha redefinida com sucesso." }`. |
| 400    | Token inválido, expirado ou já utilizado; ou `new_password` não atende às regras. Mensagem genérica: ex. "Link inválido ou expirado." |
| 429    | Rate limiting (ex.: muitas tentativas com tokens inválidos). |

---

## 3. Modelo de dados (sugestão para DBA)

Tabela **PasswordResetToken** (ou nome aprovado pelo Arquiteto):

- `token_id` (PK, UUID)
- `user_id` (FK → User)
- `tenant_id` (FK → Tenant)
- `token` (string, único; valor enviado no link)
- `expires_at` (timestamp)
- `used_at` (timestamp, nullable; preenchido ao usar no reset)
- `created_at` (timestamp)

Índice único em `token` para busca rápida. Limpeza periódica de tokens expirados/usados (job ou sob demanda).

---

## 4. E-mail

- **Conteúdo:** Link contendo o token (ex.: `https://app.example.com/reset-password?token=<TOKEN>` ou deep link do app).
- **Provedor:** Desacoplado por abstração (interface); implementação concreta definida em ADR (ex.: ADR-002). Em desenvolvimento, pode-se usar stub (log em console ou envio em arquivo).

---

## 5. Segurança

- Token: valor imprevisível (ex.: UUID v4 ou crypto.randomBytes em hex).
- Expiração: 1 h (valor configurável por variável de ambiente).
- Um token só pode ser usado uma vez (`used_at` preenchido).
- Nova senha: hash com Argon2id (mesmos parâmetros do signup/login, NFR-SEC-001).

---

*Este contrato deve ser aprovado pelo Arquiteto antes da implementação. Após aprovação, registrar em `contratos-frontend.md` e em api-endpoints.md.*
