# Confirmação do Documentador – PR feature/auth-forgot-password

**Chamado:** Passo 7 do dev-workflow (Documentador do Backend).  
**Referência:** `agents/documentador-backend.md`.

---

## Invocação

```
Documentador: atualize a documentação do backend.

**O que foi feito:** Recuperação de senha (REQ-AUTH-003): POST /api/v1/auth/forgot-password e POST /api/v1/auth/reset-password; token temporário (PasswordResetToken); abstração de e-mail (ADR-002); rate limit par IP+email.
**Arquivos/módulos alterados:** backend/src/modules/auth/ (controller, service, module, dto, ports, adapters); backend/prisma/schema.prisma; docs/backend/; docs/postman/; docs/adr/.
**Requisitos/cenários (opcional):** REQ-AUTH-003, NFR-SEC-003, ADR-002.
```

---

## Confirmação

As alterações em `docs/backend/` (e artefatos relacionados) já foram realizadas na mesma branch (feature/auth-forgot-password), em conjunto com o desenvolvimento:

| Arquivo | Alteração |
|---------|-----------|
| **contratos-frontend.md** | Seções 2.1 e 2.2: POST /auth/forgot-password e POST /auth/reset-password — request body, respostas 200/400/429, descrição dos campos. |
| **api-endpoints.md** | Novos endpoints: POST /auth/forgot-password e POST /auth/reset-password (paths, body, respostas); removido "Recuperação de senha" da lista de planejados. |
| **README.md** | Estado atual: Auth inclui recuperação de senha (forgot-password, reset-password, ADR-002); pendentes atualizados. |
| **CHANGELOG.md** | Nova entrada: "2026-03-05 – Recuperação de senha (REQ-AUTH-003)". |
| **CONTRATO-AUTH-RECUPERACAO-SENHA.md** | Contrato para o Arquiteto: fluxo, endpoints, modelo de dados, e-mail, segurança. |
| **docs/adr/ADR-002-provedor-email-recuperacao-senha.md** | ADR: abstração do provedor de e-mail (interface + stub). |

**Postman:** `docs/postman/Fitness-Coach-API-Epico1.postman_collection.json` — novos requests "POST Forgot Password" e "POST Reset Password" na pasta Auth, com testes de status.

Nenhuma alteração adicional em `docs/backend/` é necessária para este PR. O Documentador confirma que a documentação está alinhada ao código atual e que a entrada no CHANGELOG foi registrada.

---

*Documentador do Backend – confirmação para o passo 7 do fluxo.*
