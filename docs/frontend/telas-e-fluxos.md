# Telas e Fluxos

## Rotas

O app usa uma única rota inicial: **AuthGate**. Não há roteador nomeado (go_router, etc.); a navegação entre telas é feita por `Navigator.push`/`pushReplacement` a partir das telas de auth.

| Rota / tela | Quando é exibida |
|-------------|------------------|
| AuthGate | Sempre ao abrir o app; decide o que exibir abaixo |
| LoadingScreen | Enquanto AuthGate verifica o token |
| LoginScreen | Estado `Unauthenticated` ou `AuthError` |
| PlaceholderHomeScreen | Estado `Authenticated` |
| SignupScreen | Acesso a partir do Login (“Cadastrar”) |
| ForgotPasswordScreen | A partir do Login (“Esqueci a senha”) |
| ResetPasswordScreen | Deep link / link de email (token na URL); envia token + nova senha |

## Fluxos

### Fluxo de login

1. Usuário abre o app → AuthGate → verificação de token.
2. Sem token ou token inválido → LoginScreen.
3. Usuário informa email/senha → POST `/auth/login` → em sucesso, token salvo e `pushReplacement` para PlaceholderHomeScreen.
4. 401 em qualquer chamada posterior → interceptor remove token → volta para LoginScreen.

### Fluxo de cadastro

1. Na LoginScreen, usuário toca em “Cadastrar” → SignupScreen.
2. Preenche email, senha, nome → POST `/auth/signup` → 201: volta para Login (ou mensagem de sucesso); 400/409: mensagens exibidas na tela.

### Fluxo “Esqueci a senha”

1. Na LoginScreen, usuário toca em “Esqueci a senha” → ForgotPasswordScreen.
2. Informa email → POST `/auth/forgot-password` → 200: mensagem de sucesso (email enviado); 400/429: mensagens exibidas.

### Fluxo “Redefinir senha”

1. Usuário abre link do email (deep link) com token → ResetPasswordScreen recebe o token (ex.: query param).
2. Informa nova senha (e confirmação) → POST `/auth/reset-password` com token + nova senha → 200: sucesso, redireciona para Login; 400/429: mensagens exibidas.

## Endpoints por tela

| Tela | Método e endpoint | Request (resumo) | Response (resumo) |
|------|-------------------|------------------|-------------------|
| SignupScreen | POST `/auth/signup` | email, password, name | 201 vazio; 400 validação; 409 email já utilizado |
| LoginScreen | POST `/auth/login` | email, password | 200 `{ access_token }`; 400/401/429 |
| ForgotPasswordScreen | POST `/auth/forgot-password` | email | 200 vazio; 400/429 |
| ResetPasswordScreen | POST `/auth/reset-password` | token, newPassword (e confirmação na UI) | 200 vazio; 400 token inválido/expirado; 429 |
| AuthGate | (nenhum; só lê token do storage) | — | — |
| PlaceholderHomeScreen | (nenhum por enquanto) | — | — |

Contratos completos: [docs/backend/contratos-frontend.md](../backend/contratos-frontend.md).
