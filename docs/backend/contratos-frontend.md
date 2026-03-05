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
