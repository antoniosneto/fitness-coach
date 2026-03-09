# Arquitetura do Frontend

## Stack

| Tecnologia | Uso |
|------------|-----|
| Flutter | UI (Android, Web) |
| Riverpod | Estado global e injeção (providers) |
| Freezed + json_serializable | Modelos imutáveis, request/response, código gerado (.g.dart) |
| Dio | HTTP client; base URL e interceptors em `core/network` |
| flutter_secure_storage | Armazenamento do JWT (access_token) |

## Estrutura de pastas

```
app/lib/
├── main.dart              # runApp, ProviderScope
├── app.dart               # MaterialApp, rota inicial = AuthGate
├── core/
│   ├── config/            # AppConfig (API_BASE_URL, timeouts)
│   ├── network/           # DioClient, ApiError, interceptor Bearer, 401 → logout
│   └── storage/           # SecureStorage (token)
├── features/
│   └── auth/
│       ├── data/          # Request/Response (Freezed), AuthApi, AuthState
│       ├── providers/     # authStateProvider (Riverpod)
│       └── presentation/  # Telas: Login, Signup, ForgotPassword, ResetPassword, AuthGate, PlaceholderHome
└── shared/
    └── widgets/           # LoadingScreen
```

## Convenções

- **Widgets de tela:** `ConsumerWidget` ou `ConsumerStatefulWidget` quando precisam de `ref.watch`/`ref.read`.
- **Token:** guardado apenas em `SecureStorage`; enviado via interceptor no header `Authorization: Bearer <token>`.
- **401:** interceptor trata resposta 401 removendo token e fazendo logout (usuário volta para Login).
- **Erros de API:** convertidos para `ApiError` (statusCode, message); UI exibe mensagem ao usuário.
- **Rota inicial:** sempre `AuthGate`; ele decide entre `PlaceholderHomeScreen` (token válido) ou `LoginScreen` (sem token / erro).
