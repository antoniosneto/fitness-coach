# API – Endpoints

Base URL: **`/api/v1`** (ex.: `http://localhost:3000/api/v1`).

Todas as requisições JSON devem usar header `Content-Type: application/json`. Rotas protegidas exigem `Authorization: Bearer <access_token>`.

**Para o Frontend:** o formato exato de **dados a enviar** (request body) e **dados a receber** (response body por status) está em **[contratos-frontend.md](contratos-frontend.md)**. Use esse documento para implementar as chamadas e o tratamento de erros sem depender do código do backend.

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

**Request (exemplo):** `{ "email": "usuario@email.com", "password": "minhasenha123", "name": "Nome" }`  
**Response 201:** corpo vazio. **Response 409:** `{ "statusCode": 409, "message": "Email já utilizado.", "error": "Conflict" }`. Detalhes em [contratos-frontend.md](contratos-frontend.md).

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

**Request (exemplo):** `{ "email": "usuario@email.com", "password": "minhasenha123" }`  
**Response 200:** `{ "access_token": "<JWT>" }` — guardar e enviar em `Authorization: Bearer <token>` nas rotas protegidas.  
**Respostas 401/429/400:** body com `statusCode`, `message`, `error`. Detalhes em [contratos-frontend.md](contratos-frontend.md).

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

**Request (exemplo):** `{ "name": "...", "sex": "male", "birth_date": "1990-01-15", "weight_kg": 80, "height_cm": 175 }`. Opcionais: `body_fat_percentage`, `body_fat_visual_id`.  
**Response 200:** corpo vazio. Erros: [contratos-frontend.md](contratos-frontend.md).

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

**Request (exemplo):** `{ "current_weight_kg": 80, "current_body_fat_percent": 22, "target_weight_kg": 75, "target_body_fat_percent": 18, "months_to_target": 4, "intensity": "medium" }`  
**Response 200:** corpo vazio. **Response 422:** `message` descreve o limite de 1,5%/semana. Detalhes em [contratos-frontend.md](contratos-frontend.md).

---

## Plans

Rotas protegidas: enviar `Authorization: Bearer <access_token>`.

### POST /api/v1/plans/weekly

Gera o plano semanal (Motor de Metas: GCT Mifflin-St Jeor, déficit por intensidade, sugestão de refeições via TACO). Verifica se onboarding (UserProfile e BodyCompositionGoal) está completo; caso contrário retorna 422.

**Request body:** nenhum (usa dados do usuário autenticado e do perfil/metas já cadastrados).

**Respostas:**

| Código | Descrição |
|--------|-----------|
| 201    | Plano semanal gerado; body com weekly_plan_id, start_date, end_date, target_kcal_per_day, summary (daily_targets, suggested_meals) |
| 401    | Não autenticado |
| 422    | Dados de onboarding incompletos (perfil ou metas ausentes) |

**Response 201:** ver formato exato em [contratos-frontend.md](contratos-frontend.md). Detalhes de erros em 422: [contratos-frontend.md](contratos-frontend.md).

---

## Endpoints planejados (Épico 1, ainda não implementados)

- Recuperação de senha (REQ-AUTH-003).
- Preferências de treino/esporte (se definido no contrato).

Contratos detalhados: PRD e refinamento técnico.
