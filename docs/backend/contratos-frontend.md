# Contratos para o Frontend – Request e Response

Este documento define **exatamente** o que o frontend deve **enviar** (request body) e o que **receberá** (response body) em cada endpoint. Use-o para montar DTOs, modelos e tratamento de erros **sem precisar ler o código do backend**.

**Base URL:** `http://localhost:3000/api/v1` (ou a URL do ambiente).  
**Header obrigatório em todas as requisições JSON:** `Content-Type: application/json`.  
**Rotas protegidas:** header `Authorization: Bearer <access_token>` (token retornado por `POST /auth/login`).

---

## 1. POST /api/v1/auth/signup

**O que o frontend envia (body):**

```json
{
  "email": "usuario@email.com",
  "password": "minhasenha123",
  "name": "Nome do Usuário"
}
```

| Campo     | Tipo   | Obrigatório | Regras |
|-----------|--------|-------------|--------|
| email     | string | sim         | Formato email válido |
| password  | string | sim         | Mínimo 8 caracteres |
| name      | string | sim         | Qualquer string |

**O que o frontend recebe:**

| Status | Body |
|--------|------|
| **201** | Corpo vazio (sem conteúdo). Considerar sucesso e redirecionar para login ou onboarding. |
| **400** | `{ "statusCode": 400, "message": ["campo1 é inválido", ...], "error": "Bad Request" }` — erros de validação (array de mensagens). |
| **409** | `{ "statusCode": 409, "message": "Email já utilizado.", "error": "Conflict" }` |

---

## 2. POST /api/v1/auth/login

**O que o frontend envia (body):**

```json
{
  "email": "usuario@email.com",
  "password": "minhasenha123"
}
```

| Campo    | Tipo   | Obrigatório |
|----------|--------|-------------|
| email    | string | sim         |
| password | string | sim         |

**O que o frontend recebe:**

| Status | Body |
|--------|------|
| **200** | `{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }` — guardar o valor de `access_token` (ex.: armazenamento seguro) e enviá-lo no header `Authorization: Bearer <access_token>` em todas as rotas protegidas. |
| **400** | `{ "statusCode": 400, "message": [...], "error": "Bad Request" }` |
| **401** | `{ "statusCode": 401, "message": "Credenciais inválidas.", "error": "Unauthorized" }` |
| **429** | `{ "statusCode": 429, "message": "Muitas tentativas. Tente novamente em 15 minutos.", "error": "Too Many Requests" }` — bloquear novas tentativas por 15 min (mesmo par IP/email). |

---

## 2.1. POST /api/v1/auth/forgot-password (REQ-AUTH-003)

**Autenticação:** não exigida.

**O que o frontend envia (body):**

```json
{
  "email": "usuario@email.com"
}
```

| Campo | Tipo   | Obrigatório |
|-------|--------|-------------|
| email | string | sim         | Formato email válido |

**O que o frontend recebe:**

| Status | Body |
|--------|------|
| **200** | Corpo vazio. Sempre 200 (não indica se o e-mail existe). Exibir mensagem: "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha." |
| **400** | `{ "statusCode": 400, "message": [...], "error": "Bad Request" }` — validação (ex.: e-mail inválido). |
| **429** | `{ "statusCode": 429, "message": "Muitas tentativas. Tente novamente em 15 minutos.", "error": "Too Many Requests" }` — rate limit (par IP+email). |

---

## 2.2. POST /api/v1/auth/reset-password (REQ-AUTH-003)

**Autenticação:** não exigida. Token recebido por e-mail no link de recuperação.

**O que o frontend envia (body):**

```json
{
  "token": "valor-do-token-recebido-no-email",
  "new_password": "novasenha123"
}
```

| Campo        | Tipo   | Obrigatório |
|--------------|--------|-------------|
| token        | string | sim         | Token do link de redefinição |
| new_password | string | sim         | Mínimo 8 caracteres |

**O que o frontend recebe:**

| Status | Body |
|--------|------|
| **200** | Corpo vazio. Senha redefinida; redirecionar para login. |
| **400** | `{ "statusCode": 400, "message": "Link inválido ou expirado.", "error": "Bad Request" }` — token inválido, expirado ou já usado; ou senha não atende às regras. |
| **429** | `{ "statusCode": 429, ... }` — rate limiting. |

---

## 3. PUT /api/v1/onboarding/profile

**Autenticação:** obrigatório header `Authorization: Bearer <access_token>`.

**O que o frontend envia (body):**

```json
{
  "name": "Nome do Usuário",
  "sex": "male",
  "birth_date": "1990-01-15",
  "weight_kg": 80,
  "height_cm": 175,
  "body_fat_percentage": 22
}
```

| Campo                | Tipo   | Obrigatório | Regras |
|----------------------|--------|-------------|--------|
| name                 | string | sim         | — |
| sex                  | string | sim         | Exatamente um de: `"male"`, `"female"`, `"other"` |
| birth_date           | string | sim         | Data ISO (YYYY-MM-DD) |
| weight_kg            | number | sim         | Entre 20 e 300 |
| height_cm            | number | sim         | Entre 100 e 250 |
| body_fat_percentage  | number | não         | Entre 5 e 60. Opcional se enviar `body_fat_visual_id`. |
| body_fat_visual_id   | string | não         | Se enviado, o backend converte para número e grava em body_fat_percentage (ex.: `"25"`, `"medium"`, `"biotype_medium"`). |

**O que o frontend recebe:**

| Status | Body |
|--------|------|
| **200** | Corpo vazio. Perfil atualizado com sucesso. |
| **400** | `{ "statusCode": 400, "message": [...], "error": "Bad Request" }` |
| **401** | `{ "statusCode": 401, "message": "Unauthorized", "error": "Unauthorized" }` — token ausente ou inválido; redirecionar para login. |
| **404** | `{ "statusCode": 404, "message": "Perfil não encontrado.", "error": "Not Found" }` |

---

## 4. PUT /api/v1/onboarding/goals

**Autenticação:** obrigatório header `Authorization: Bearer <access_token>`.

**O que o frontend envia (body):**

```json
{
  "current_weight_kg": 80,
  "current_body_fat_percent": 22,
  "target_weight_kg": 75,
  "target_body_fat_percent": 18,
  "months_to_target": 4,
  "intensity": "medium"
}
```

| Campo                    | Tipo   | Obrigatório | Regras |
|--------------------------|--------|-------------|--------|
| current_weight_kg       | number | sim         | ≥ 20 |
| current_body_fat_percent| number | sim         | ≥ 5 |
| target_weight_kg        | number | sim         | ≥ 20 |
| target_body_fat_percent | number | sim         | ≥ 5 |
| months_to_target        | int    | sim         | ≥ 1 |
| intensity               | string | sim         | Exatamente um de: `"light"`, `"medium"`, `"high"` |

**O que o frontend recebe:**

| Status | Body |
|--------|------|
| **200** | Corpo vazio. Meta aceita e armazenada. |
| **400** | `{ "statusCode": 400, "message": [...], "error": "Bad Request" }` |
| **401** | `{ "statusCode": 401, "message": "Unauthorized", "error": "Unauthorized" }` |
| **422** | `{ "statusCode": 422, "message": "Taxa de perda semanal (X.XX%) excede o limite seguro de 1.5% do peso corporal. Ajuste a meta ou o prazo.", "error": "Unprocessable Entity" }` — exibir a mensagem ao usuário e permitir ajustar meta ou prazo. |

---

## 5. POST /api/v1/plans/weekly

**Autenticação:** obrigatório header `Authorization: Bearer <access_token>`.

**O que o frontend envia (body):** Nenhum. O backend usa o usuário do JWT e os dados já cadastrados em perfil e metas.

**O que o frontend recebe:**

| Status | Body |
|--------|------|
| **201** | Objeto com: `weekly_plan_id`, `start_date`, `end_date`, `target_kcal_per_day`, `summary` (contendo `daily_targets`, `suggested_meals`, `weekly_training` e `machines_only` — ver exemplo). |
| **401** | `{ "statusCode": 401, "message": "Unauthorized", "error": "Unauthorized" }` |
| **422** | `{ "statusCode": 422, "message": "Dados de onboarding incompletos. Conclua perfil e metas antes de gerar o plano.", "error": "Unprocessable Entity" }` — orientar o usuário a completar perfil e metas antes de gerar o plano. |

**Exemplo de response 201:**

```json
{
  "weekly_plan_id": "uuid",
  "start_date": "2026-03-03",
  "end_date": "2026-03-09",
  "target_kcal_per_day": 1920,
  "summary": {
    "daily_targets": { "kcal": 1920, "protein_g": 128, "carb_g": 180, "fat_g": 64 },
    "suggested_meals": [
      { "food_id": "...", "description": "Arroz...", "kcal": 130, "protein_g": 2.7, "carb_g": 28, "fat_g": 0.3 }
    ],
    "weekly_training": [
      { "day_of_week": 1, "day_name": "Segunda", "type": "rest", "description": "Descanso" },
      { "day_of_week": 4, "day_name": "Quinta", "type": "legs", "description": "Pernas (quadríceps e posterior)" },
      { "day_of_week": 5, "day_name": "Sexta", "type": "active_rest", "description": "Descanso ativo" },
      { "day_of_week": 6, "day_name": "Sábado", "type": "upper_body", "description": "Membros superiores (Upper Day Estético)" },
      { "day_of_week": 7, "day_name": "Domingo", "type": "legs", "description": "Pernas (quadríceps e posterior)" }
    ],
    "machines_only": true
  }
}
```

- `summary.weekly_training`: array de 7 dias (SCN-TRAIN-ROTINA-MAQUINAS). Cada item: `day_of_week` (1=segunda .. 7=domingo), `day_name`, `type` (`rest` \| `active_rest` \| `upper_body` \| `legs` \| `training`), `description`.
- `summary.machines_only`: quando `true`, sugestões de exercício (em épicos futuros) devem priorizar máquinas e excluir peso livre.

---

## Formato padrão de erro (NestJS)

Em respostas 4xx/5xx, o body segue o padrão:

```ts
{
  statusCode: number;   // 400, 401, 404, 409, 422, 429, etc.
  message: string | string[];  // mensagem única ou array de erros de validação
  error?: string;       // ex.: "Bad Request", "Unauthorized", "Conflict"
}
```

O frontend deve tratar `message` (string ou array) para exibir ao usuário e usar `statusCode` para decisões (ex.: 401 → logout, 429 → desabilitar botão por 15 min).
