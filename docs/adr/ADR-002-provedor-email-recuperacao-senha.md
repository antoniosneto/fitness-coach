# ADR-002: Provedor de e-mail para recuperação de senha (REQ-AUTH-003)

**Status:** Aceito  
**Decisores:** Arquiteto  
**Data:** 2026-03-05  
**Contexto:** PRD §2.1 (REQ-AUTH-003) exige envio de e-mail com token para “Esqueci minha senha”. O PRD (pergunta 1) pede que o Arquiteto proponha abstração que desacople o provedor de e-mail.

---

## Decisão

### 1. Abstração do provedor de e-mail

- O Backend **não** dependerá diretamente de um provedor específico (SES, SendGrid, SMTP, etc.) no domínio de autenticação.
- Será definida uma **interface** (ex.: `IEmailSender` ou `MailSender`) com método para “enviar e-mail” (destinatário, assunto, corpo texto e/ou HTML).
- O módulo de Auth (ou um módulo compartilhado de “mail”) dependerá apenas dessa interface; a implementação concreta será injetada (NestJS: provider).

### 2. Implementações

- **Desenvolvimento / testes:** Implementação **stub** que:
  - não envia e-mail real;
  - registra em log (ex.: `console`) o destinatário, assunto e presença do link com token (sem logar o token completo por segurança).
  - Opcional: escrever em arquivo ou variável para testes E2E.
- **Produção:** Implementação concreta a ser escolhida em deploy (SES, SendGrid, Nodemailer com SMTP, etc.). A escolha do provedor e credenciais (variáveis de ambiente) não faz parte deste ADR; apenas a interface e o comportamento de “enviar” são contratos.

### 3. Contrato da interface (mínimo)

- Método: `send(params: { to: string; subject: string; text?: string; html?: string }): Promise<void>`.
- Em caso de falha do provedor, o método pode lançar ou retornar erro; o chamador (AuthService) decide se retorna 200 ao usuário mesmo assim (para não revelar se o e-mail existe) ou 500 (conforme política de produto). **Decisão:** manter 200 mesmo em falha de envio (não revelar existência do e-mail); registrar falha em log para operação.

### 4. Onde fica a interface e o stub

- Backend: ex. `src/modules/auth/ports/mail-sender.interface.ts` (ou `src/core/mail/` se for reutilizado em outros módulos).
- Stub: ex. `src/modules/auth/adapters/console-mail-sender.service.ts` (ou em `core/mail/adapters/`).
- Registro no AuthModule: provider da interface apontando para o stub por padrão; em produção, trocar o provider (variável de ambiente ou módulo de configuração).

---

## Consequências

- Recuperação de senha pode ser implementada sem definir ainda o provedor de e-mail em produção.
- Troca de provedor (SES, SendGrid, etc.) não exige alteração no fluxo de Auth, apenas nova implementação da interface e configuração do provider.
- Testes podem usar o stub ou um mock da interface.
