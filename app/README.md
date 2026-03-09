# Fitness Coach – App Flutter (Épico 1)

App Android (Flutter) do produto Fitness Coach. Fase 1: autenticação (login, signup, forgot-password, reset-password).

## Pré-requisitos

- Flutter SDK (estável, compatível com Android 16 / API 29+)
- Backend rodando em `http://localhost:3000` (ver `docs/backend/ambiente-e-contratos.md`)

## Configuração

```bash
cd app
flutter pub get
```

Para usar outra base URL (ex.: emulador Android apontando para host):

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1
```

(Em Android emulador, `10.0.2.2` é o localhost da máquina.)

## Executar

```bash
flutter run
```

## Contratos

Request/response de cada endpoint: `docs/backend/contratos-frontend.md`.  
Endpoints: `docs/backend/api-endpoints.md`.

## Estrutura (AGENTS.md)

- `lib/core/` – config, rede (Dio), armazenamento seguro, erro API
- `lib/features/auth/` – dados (modelos), API, providers, telas
- `lib/shared/` – widgets comuns
