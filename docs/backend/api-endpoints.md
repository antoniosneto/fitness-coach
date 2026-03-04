# API – Endpoints

Base URL: **`/api/v1`** (ex.: `http://localhost:3000/api/v1`).

Todas as requisições JSON devem usar header `Content-Type: application/json`. Rotas protegidas exigem `Authorization: Bearer <access_token>`.

---

## Auth

### POST /api/v1/auth/signup

Cria usuário e perfil inicial no tenant default.

**Request body:**

| Campo    | Tipo   | Obrigatório | Descrição        |
|----------|--------|-------------|------------------|
| email    | string | sim         | Formato email    |
| password | string | sim         | Mínimo 8 caracteres |
| name     | string | sim         | Nome do usuário  |

**Respostas:**

| Código | Descrição           |
|--------|---------------------|
| 201    | Usuário criado      |
| 409    | Email já utilizado no tenant |
| 400    | Payload inválido (validação)   |

**Exemplo (201):** corpo vazio ou sem body obrigatório na resposta.

---

### POST /api/v1/auth/login

Autentica e retorna JWT.

**Request body:**

| Campo    | Tipo   | Obrigatório | Descrição |
|----------|--------|-------------|-----------|
| email    | string | sim         | Formato email |
| password | string | sim         | Senha em texto (enviada por HTTPS) |

**Resposta 200 (sucesso):**

```json
{
  "access_token": "<JWT>"
}
```

O JWT contém (claims): `sub` (user_id), `tenant_id`, `roles`, `exp` (expiração, ex.: 7 dias).

**Respostas:**

| Código | Descrição |
|--------|-----------|
| 200    | Login OK; body: `{ "access_token": "..." }` |
| 401    | Credenciais inválidas |
| 429    | Muitas tentativas (bloqueio 15 min por IP+email) |
| 400    | Payload inválido |

---

## Onboarding

Rotas protegidas: enviar `Authorization: Bearer <access_token>` (JWT obtido em `/auth/login`).

### PUT /api/v1/onboarding/profile

Atualiza dados básicos e biométricos do perfil do usuário (UserProfile). Se `body_fat_visual_id` for enviado, o backend converte para valor numérico e persiste em `body_fat_percentage` (SCN-ONB-BIOTIPO-VISUAL).

**Request body:**

| Campo                 | Tipo   | Obrigatório | Descrição |
|-----------------------|--------|-------------|-----------|
| name                  | string | sim         | Nome |
| sex                   | string | sim         | `male` \| `female` \| `other` |
| birth_date            | string | sim         | Data ISO (ex.: `1990-01-15`) |
| weight_kg             | number | sim         | Peso em kg (20–300) |
| height_cm             | number | sim         | Altura em cm (100–250) |
| body_fat_percentage   | number | não         | % gordura (5–60) |
| body_fat_visual_id    | string | não         | Id da imagem de biotipo; se enviado, converte e grava em body_fat_percentage |

**Respostas:**

| Código | Descrição |
|--------|-----------|
| 200    | Perfil atualizado |
| 400    | Payload inválido (validação) |
| 401    | Não autenticado (JWT ausente ou inválido) |
| 404    | Perfil não encontrado |

---

### PUT /api/v1/onboarding/goals

Define meta de composição corporal (BodyCompositionGoal). Valida taxa de perda semanal ≤ 1,5% do peso (REQ-GOAL-001); caso contrário retorna 422.

**Request body:**

| Campo                     | Tipo   | Obrigatório | Descrição |
|---------------------------|--------|-------------|-----------|
| current_weight_kg         | number | sim         | Peso atual (kg) |
| current_body_fat_percent  | number | sim         | % gordura atual |
| target_weight_kg          | number | sim         | Peso alvo (kg) |
| target_body_fat_percent   | number | sim         | % gordura alvo |
| months_to_target          | int    | sim         | Meses até a meta (≥ 1) |
| intensity                 | string | sim         | `light` \| `medium` \| `high` |

**Respostas:**

| Código | Descrição |
|--------|-----------|
| 200    | Meta aceita e armazenada |
| 400    | Payload inválido (validação) |
| 401    | Não autenticado |
| 422    | Meta fisiologicamente insegura (taxa de perda > 1,5%/semana) |

---

## Endpoints planejados (Épico 1, ainda não implementados)

- **POST /api/v1/plans/weekly** – Gerar plano semanal (autenticado).

Contratos detalhados: PRD e refinamento técnico.
