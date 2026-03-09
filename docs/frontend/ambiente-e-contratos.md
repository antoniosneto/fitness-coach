# Ambiente e Contratos

## Variáveis de ambiente

| Variável | Onde é usada | Valor padrão |
|----------|----------------|--------------|
| `API_BASE_URL` | `lib/core/config/app_config.dart` (String.fromEnvironment) | `http://localhost:3000/api/v1` |

Em produção ou outros ambientes, definir no build (ex.: `--dart-define=API_BASE_URL=https://api.exemplo.com/api/v1`).

Timeouts configurados no mesmo arquivo: connect e receive em 30 segundos.

## Contratos do backend

O frontend consome os endpoints documentados em:

- **[docs/backend/contratos-frontend.md](../backend/contratos-frontend.md)** – Request e response de cada endpoint (signup, login, forgot-password, reset-password). Use para validar payloads e mensagens de erro.
- **api-endpoints.md** (se existir em `docs/backend/`) – Lista de rotas e métodos; o app usa apenas as rotas de auth acima.

Headers: todas as requisições JSON usam `Content-Type: application/json`. Rotas protegidas (futuras) usam `Authorization: Bearer <access_token>` via interceptor do Dio.
