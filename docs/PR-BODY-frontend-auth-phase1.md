# PR – Frontend Fase 1: Auth (login, signup, forgot-password, reset-password)

## Objetivo

Implementação da **Fase 1** do frontend (Épico 1): autenticação completa (login, signup, esqueci minha senha, redefinir senha), core (Dio, armazenamento seguro, tratamento de erros API), roteamento e AuthGate. Inclui ajustes no backend necessários para o app web (CORS) e para teste em dev (stub de e-mail exibe link de reset no console).

**PRD:** `PRD/prd-001-auth-onboarding-metas.md`  
**Refinamento:** `refinamentos técnicos/refinamento-tecnico-001-auth-onboarding-metas.md` (seção 4 – Frontend)  
**Plano:** `docs/PLANO-FRONTEND-EPICO1.md`  
**Decisões:** `docs/adr/ADR-003-decisoes-frontend-epico1.md`, `AGENTS.md`

## Requisitos / Cenários

- **REQ-AUTH-001** – Login com JWT
- **REQ-AUTH-002** – Prevenção de força bruta (429 após 5 falhas; mensagem no app)
- **REQ-AUTH-003** – Recuperação de senha (forgot-password, reset-password)

## Alterações

### Frontend (`app/`)

- **Core:** `lib/core/config`, `lib/core/network` (Dio, ApiError, interceptor Bearer + on401), `lib/core/storage` (SecureStorage com flutter_secure_storage).
- **Auth:** modelos (login/signup/forgot/reset request + login response, auth_state); `AuthApi`; providers (secureStorage, dio, authApi, authStateProvider); telas Login, Signup, ForgotPassword, ResetPassword; AuthGate (checkToken → Login ou PlaceholderHome); PlaceholderHome (logout).
- **Shared:** `LoadingScreen`.
- **Web:** `web/index.html`, `web/manifest.json` (suporte web para `flutter run -d chrome`).
- Contratos seguem `docs/backend/contratos-frontend.md`. JWT apenas em flutter_secure_storage; 401 → logout (ADR-003).

### Backend (ajustes para o frontend)

- **CORS:** `main.ts` – `app.enableCors({ origin: true, credentials: true })` para o app web chamar a API.
- **Stub de e-mail:** `console-mail-sender.service.ts` – em dev, log no terminal do link de reset para copiar e testar a tela de redefinir senha.

## Tamanho

Aproximadamente ~500 linhas (novo código em `app/` + alterações pontuais no backend). Contagem exata: `git diff main --stat`.

## Como testar

1. Backend: `cd backend && npm run start:dev`
2. Frontend: `cd app && flutter pub get && flutter run -d chrome`
3. Fluxos: criar conta → login → esqueci senha (link no terminal do backend) → redefinir senha; 401/409/429 com mensagem na UI.

---

**Review:** Agente Arquiteto (`agents/arquiteto-software.md`) e Product Manager (`agents/product-manager.md`) conforme `agents/dev-workflow.md`.
