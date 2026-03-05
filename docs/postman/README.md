# Postman – Fitness Coach API (Épico 1)

## Collection

- **Arquivo:** `Fitness-Coach-API-Epico1.postman_collection.json`
- **Endpoints:** Auth (signup, login) e Onboarding (profile, goals), **incluindo teste de 422** em Goals (REQ-GOAL-001).

## Como usar

### 1. Importar a collection no Postman

1. Abra o Postman.
2. **Import** → **Upload Files** (ou arraste o arquivo) → selecione `Fitness-Coach-API-Epico1.postman_collection.json`.
3. A collection **Fitness Coach API – Épico 1** aparecerá na barra lateral.

### 2. Garantir que o backend está rodando

No terminal:

```bash
cd backend
npm run start:dev
```

A API deve estar em **http://localhost:3000**. Se usar outra porta, altere a variável **base_url** na collection (clique na collection → aba **Variables**).

### 3. Ordem para validar todos os endpoints (incluindo 422)

Execute na ordem abaixo. O **Login** grava o token automaticamente na variável **access_token**, usada nas rotas de onboarding.

| # | Request | O que validar |
|---|---------|---------------|
| 1 | **Auth → Signup** | 201 Created (ou 409 se o email já existir). |
| 2 | **Auth → Login** | 200 OK e body com `access_token`. O script salva o token. |
| 3 | **Onboarding → PUT Profile** | 200 OK. Se der 401, rode o Login de novo. |
| 4 | **Onboarding → PUT Goals** | 200 OK (meta segura: 80→75 kg em 4 meses). |
| 5 | **Onboarding → PUT Goals (expect 422)** | **422** Unprocessable Entity. Valida REQ-GOAL-001: taxa de perda > 1,5%/semana (80→60 kg em 2 meses). O script de teste confere status 422 e que a mensagem menciona o limite (1,5%). |

### 4. Teste 422 em Goals (REQ-GOAL-001)

O request **PUT Goals (expect 422)** já vem com um body que força a rejeição:

- `current_weight_kg`: 80, `target_weight_kg`: 60, `months_to_target`: 2  
- Taxa de perda semanal fica acima de 1,5%; a API deve retornar **422** e mensagem sobre o limite seguro.

Os **Tests** do Postman verificam automaticamente: status 422 e presença de "1.5" na mensagem de erro.

### 5. Rodar a collection inteira (Runner)

No Postman: clique na collection → **Run** → selecione todos os requests (ou só os que quiser) → **Run Fitness Coach API…**. A ordem da tabela acima é respeitada se os requests estiverem na mesma ordem na collection. Confira na aba **Test Results** que o **PUT Goals (expect 422)** passou (status 422 e assertions ok).

### 6. Variáveis da collection

| Variável      | Valor padrão              | Uso |
|---------------|---------------------------|-----|
| **base_url**  | `http://localhost:3000`  | Base da API. |
| **access_token** | (vazio)               | Preenchido automaticamente pelo script do **Login**. |

Para trocar o email/senha dos requests, edite o body de **Signup** e **Login** (use o mesmo email em ambos).
