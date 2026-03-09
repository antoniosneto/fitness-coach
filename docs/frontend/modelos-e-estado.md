# Modelos e Estado

## Estado de autenticação (AuthState)

Classe selada em `lib/features/auth/data/auth_state.dart`; a UI trata todos os casos com `switch`/`when`.

| Estado | Significado |
|--------|-------------|
| `Unauthenticated` | Sem token ou não verificado ainda |
| `Authenticating` | Login/signup em andamento |
| `Authenticated` | Token válido (usuário logado) |
| `AuthError` | Erro com mensagem (ex.: credenciais inválidas) |

## Providers principais

| Provider | Arquivo | Função |
|----------|---------|--------|
| `authStateProvider` | `features/auth/providers/auth_provider.dart` | Estado global de auth; expõe `AuthState` e métodos: `checkToken()`, `login()`, `signup()`, `forgotPassword()`, `resetPassword()`, `logout()` |

As telas usam `ref.watch(authStateProvider)` para reagir ao estado e `ref.read(authStateProvider.notifier)` para disparar ações.

## Modelos de request (Freezed + JSON)

| Modelo | Arquivo | Uso |
|--------|---------|-----|
| `SignupRequest` | `auth/data/signup_request.dart` | POST /auth/signup: email, password, name |
| `LoginRequest` | `auth/data/login_request.dart` | POST /auth/login: email, password |
| `ForgotPasswordRequest` | `auth/data/forgot_password_request.dart` | POST /auth/forgot-password: email |
| `ResetPasswordRequest` | `auth/data/reset_password_request.dart` | POST /auth/reset-password: token, newPassword |

Todos possuem `toJson()` e arquivos `.g.dart` gerados por build_runner.

## Modelos de response

| Modelo | Arquivo | Uso |
|--------|---------|-----|
| `LoginResponse` | `auth/data/login_response.dart` | POST /auth/login 200: `access_token` |

Erros não são tipados com Freezed; a camada de rede converte `DioException` em `ApiError` (statusCode, message) para exibição na UI.
