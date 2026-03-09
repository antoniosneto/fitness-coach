# Plano de Implementação Frontend – Épico 1

**Autor:** Agente Frontend (`agents/frontend.md`), em alinhamento com Arquiteto (`agents/arquiteto-software.md`), Backend (`agents/backend.md`) e documentação em `docs/backend/`.  
**Referências:** `objective.md`, `PRD/prd-001-auth-onboarding-metas.md`, `refinamentos técnicos/refinamento-tecnico-001-auth-onboarding-metas.md`, `docs/backend/contratos-frontend.md`, `docs/backend/api-endpoints.md`.

---

## 1. Resumo do que o Frontend entendeu

### 1.1 Do Arquiteto e do produto

- **Papel do Frontend:** Implementar em Flutter (Riverpod + Freezed) todas as telas, fluxos e integrações com a API do Épico 1. Não decidir arquitetura global, nem criar requisitos; apenas consumir PRD, refinamento técnico, OpenAPI/contratos e modelos definidos pelo Arquiteto.
- **Regra de ouro:** Contratos primeiro, código depois. Nenhum endpoint, campo ou código de status diferente do especificado em OpenAPI/contratos.
- **Arquitetura de código:** Clean Architecture + Feature-First; UI declarativa (ConsumerWidget/HookConsumerWidget); estado em Riverpod + Freezed; domínio em Dart puro; rede/DTOs e JWT em armazenamento seguro. Estado efêmero de UI (TextEditingController, AnimationController, índice de tab) não deve ficar em Notifiers globais.

### 1.2 Do objective.md e do PRD

- App **Android** para definir e acompanhar **dieta e treino semanais**, com base em objetivos de composição corporal e preferências.
- **Épico 1** cobre: autenticação (login, signup, recuperação de senha), onboarding (dados básicos, % gordura — inclusive biotipo visual —, metas e intensidade, preferências de treino/esportes), geração do primeiro plano semanal e apresentação em **3 abas** (Perfil, Treino, Alimentação).
- NFR-UX-001: transições de tela P95 &lt; 200 ms. Tratamento explícito de 401, 409, 422, 429 e erros de rede na UI.

### 1.3 Do refinamento técnico (seção 4 – Frontend)

- **Auth:** Login (email, senha, “Esqueci minha senha”), Signup (email, senha, nome). Tratar 401 e 429 com mensagens claras; 409 no signup.
- **Onboarding:** Passo 1 (dados básicos), Passo 2 (% gordura: input numérico ou galeria de biotipo → enviar `body_fat_visual_id`; **não** calcular % no app), Passo 3 (metas e intensidade), Passo 4 (preferências de treino/esportes — mínimo para SCN-TRAIN-ROTINA-MAQUINAS).
- **Plano e abas:** Após `POST /plans/weekly` com sucesso, exibir 3 abas: Perfil, Treino (resumo do plano semanal de treino), Alimentação (resumo do plano semanal de refeições).
- **Estado:** authProvider (Unauthenticated, Authenticating, Authenticated, AuthError), onboardingProvider (passos, rascunho, erros), weeklyPlanProvider (Loading, Data, Error). Uso de `when`/`maybeWhen` para todos os estados na UI.

### 1.4 Do Backend (docs/backend)

- **Base URL:** `http://localhost:3000/api/v1` (ou variável de ambiente).
- **Implementado e documentado em `contratos-frontend.md`:**
  - **Auth:** POST signup, POST login, **POST forgot-password**, **POST reset-password** (REQ-AUTH-003).
  - **Onboarding:** PUT onboarding/profile, PUT onboarding/goals (validação 1,5%/semana → 422).
  - **Plans:** POST plans/weekly (sem body; retorna `weekly_plan_id`, `start_date`, `end_date`, `target_kcal_per_day`, `summary` com `daily_targets`, `suggested_meals`, `weekly_training`, `machines_only`).
- **Formato de erro padrão:** `{ statusCode, message: string | string[], error? }`. Frontend deve tratar `message` para exibir ao usuário e `statusCode` para decisões (401 → logout, 429 → desabilitar por 15 min, etc.).
- **Pendente no backend (não bloqueia MVP do frontend):** preferências de treino/esporte como entidades/endpoints específicos; hoje o plano semanal usa dados já cadastrados e retorna `machines_only` no summary (preferência virá de onboarding quando existir).

---

## 2. Plano de implementação (Frontend + Arquiteto)

O plano abaixo foi estruturado para ser executado em fases, respeitando dependências e contratos já definidos. Qualquer alteração de contrato ou de estrutura de pastas deve passar por ADR/AGENTS.md.

### 2.1 Pré-requisitos e decisões do Arquiteto

| Item | Status / Ação |
|------|----------------|
| **AGENTS.md** | **Resolvido.** Criado na raiz do repositório com pinagem, diretórios (Backend e Frontend), regras NestJS e papéis de cada agente. Ver `AGENTS.md`. |
| **Modelos Freezed (Dart)** | **Resolvido (ADR-003).** O Frontend deriva modelos de `docs/backend/contratos-frontend.md`; é a fonte de verdade até eventual handoff do Arquiteto. |
| **Diretório do app Flutter** | **Resolvido (AGENTS.md §2.2).** Raiz do app em **`app/`** com `lib/core`, `lib/features/auth|onboarding|plans`, `lib/shared`. Nome do pacote pode ser definido em ADR se necessário. |

### 2.2 Fase 1 – Fundação (core, rede, auth state)

**Objetivo:** Projeto Flutter criado, core (HTTP client, storage, router), modelos Freezed de auth e contratos de API, estado de autenticação em Riverpod.

1. **Estrutura de pastas (Feature-First)**  
   Alinhada ao que o Arquiteto define no AGENTS.md. Proposta mínima:
   - `lib/core/` — config, cliente HTTP (Dio), armazenamento seguro (flutter_secure_storage), interceptors (Bearer token), tratamento de erros (401, 409, 422, 429).
   - `lib/features/auth/` — dados (DTOs/Freezed), repositório/auth API, providers (authState), UI (login, signup, forgot-password, reset-password).
   - `lib/features/onboarding/` — (estrutura preparada para Fase 2).
   - `lib/features/plans/` — (estrutura preparada para Fase 3).
   - `lib/shared/` — design system, componentes comuns, widgets de loading/erro.

2. **Cliente HTTP e segurança**  
   - Dio com baseUrl configurável; interceptor que anexa `Authorization: Bearer <token>`; token lido de armazenamento seguro.  
   - JWT e credenciais **apenas** em `flutter_secure_storage` (nunca SharedPreferences).  
   - Tratamento de resposta: 401 → limpar token e redirecionar para login; 409/422/429 → mapear `message` para feedback na UI.

3. **Modelos Freezed (Auth)**  
   - Request: `LoginRequest`, `SignupRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest` (campos conforme `contratos-frontend.md`).  
   - Response: apenas `access_token` no login (tipar como objeto com um campo).  
   - Estado de auth: união selada `Unauthenticated | Authenticating | Authenticated(user) | AuthError(message)`.

4. **Providers de auth**  
   - `authNotifier` (ou equivalente com AsyncNotifier): login, signup, logout, forgot-password, reset-password.  
   - Ao fazer login com sucesso: persistir token no secure storage e atualizar estado para `Authenticated`.  
   - Ao receber 401 em qualquer rota: limpar token e estado para `Unauthenticated` (e navegar para login se o Arquiteto definir fluxo centralizado).

5. **Telas de Auth (fluxo mínimo)**  
   - **Login:** campos email, senha; botão “Esqueci minha senha” (navega para tela de forgot-password); chamar POST login; tratar 401 e 429 com SnackBar/dialog.  
   - **Signup:** email, senha, nome; POST signup; 201 → redirecionar para login (ou para onboarding se o fluxo for signup → onboarding); 409 → mensagem “Email já utilizado.”.  
   - **Forgot-password:** campo email; POST forgot-password; sempre 200 → mensagem “Se o e-mail estiver cadastrado, você receberá um link…”; 429 → mensagem de rate limit.  
   - **Reset-password:** tela acessível via deep link ou rota com query `?token=...`; campos token (pode vir da URL), new_password; POST reset-password; 200 → redirecionar para login; 400 → “Link inválido ou expirado.”.

6. **Navegação e rota inicial**  
   - Decisão de rota inicial: se há token válido (e, opcionalmente, se onboarding está completo), ir para Home (abas); senão, para Login (ou onboarding se logado e onboarding incompleto). Essa regra pode ser refinada em ADR (ex.: como “onboarding completo” é determinado — via flag no perfil ou existência de metas/plano).

### 2.3 Fase 2 – Onboarding (perfil, metas, preferências)

**Objetivo:** Fluxo multi-etapas de onboarding com persistência via API e estado em Riverpod; sem lógica de negócio na UI; estado efêmero (controladores de texto, índice do passo) em StatefulWidget ou hooks.

1. **Modelos Freezed (Onboarding)**  
   - Request: `OnboardingProfileRequest` (name, sex, birth_date, weight_kg, height_cm, body_fat_percentage?, body_fat_visual_id?), `OnboardingGoalsRequest` (current_weight_kg, current_body_fat_percent, target_weight_kg, target_body_fat_percent, months_to_target, intensity).  
   - Enums: sex (`male` | `female` | `other`), intensity (`light` | `medium` | `high`).  
   - Estado do fluxo: passo atual, rascunho do formulário (por passo), erros de validação (backend). Separar estado “efêmero” (controladores) do estado de negócio nos providers.

2. **Providers de onboarding**  
   - Provider para “rascunho” do perfil e das metas (dados que serão enviados nos PUTs).  
   - Provider para estado de submissão (Initial, Submitting, Success, Failure) por passo, para exibir loaders e mensagens.  
   - Não colocar TextEditingController nem índice de tab/step em Notifier global; usar StatefulWidget ou flutter_hooks para isso.

3. **Telas de onboarding**  
   - **Passo 1 – Dados básicos:** nome, sexo, data de nascimento, peso atual, altura. Validação mínima no cliente (formato); validação forte no backend (400). PUT profile ao avançar.  
   - **Passo 2 – % gordura:** opção “Sei meu percentual” → input numérico (5–60); opção “Não sei” → galeria de imagens de biotipo. Ao selecionar imagem, enviar **apenas** `body_fat_visual_id` (valor acordado com backend, ex.: identificador da imagem); **não** calcular percentual no app (SCN-ONB-BIOTIPO-VISUAL). Incluir body_fat_percentage ou body_fat_visual_id no mesmo PUT profile (ou segundo PUT, conforme contrato — hoje um único PUT com todos os campos).  
   - **Passo 3 – Metas:** peso alvo, % gordura alvo, prazo (meses), objetivo (perder gordura / ganhar massa / manter), intensidade (light, medium, high). PUT goals. Tratar 422 com mensagem exata do backend (taxa de perda &gt; 1,5%/semana).  
   - **Passo 4 – Preferências de treino/esportes:** conforme **ADR-003**, exibir UI esqueleto (ex.: título e placeholder/checkbox “Priorizar exercícios em máquinas”); sem persistência até haver contrato; usuário pode avançar.

4. **Transições e UX**  
   - NFR-UX-001: transições &lt; 200 ms P95; uso de `const`, RepaintBoundary onde houver animação pesada.  
   - Loaders durante submissão; mensagens de erro claras sem travar o fluxo.

### 2.4 Fase 3 – Plano semanal e abas (Perfil, Treino, Alimentação)

**Objetivo:** Chamar POST /plans/weekly após onboarding completo; exibir resultado nas 3 abas; estado do plano em Riverpod com Loading / Data / Error.

1. **Modelos Freezed (Plano)**  
   - Response 201: `WeeklyPlanResponse` com `weekly_plan_id`, `start_date`, `end_date`, `target_kcal_per_day`, `summary` (objeto com `daily_targets`, `suggested_meals`, `weekly_training`, `machines_only`).  
   - Tipar `summary.weekly_training` como lista de itens com `day_of_week`, `day_name`, `type`, `description` (enums/types conforme contratos-frontend.md).  
   - Tipar `suggested_meals` e `daily_targets` conforme o exemplo em `contratos-frontend.md`.

2. **Provider do plano semanal**  
   - AsyncNotifier (ou equivalente): ao invocar “gerar plano”, transitar para Loading; chamar POST /plans/weekly (sem body); em sucesso → Data(WeeklyPlanResponse); em 422 → Error com mensagem “Dados de onboarding incompletos…”; em 401 → tratar como auth (logout/redirecionar).

3. **Navegação por abas**  
   - Após sucesso em POST /plans/weekly, navegar para container com 3 abas: **Perfil**, **Treino**, **Alimentação**.  
   - **Perfil:** exibir dados do perfil e metas (podem vir de um GET de perfil/goals se o Arquiteto definir, ou do estado já preenchido no onboarding; para MVP, pode ser apenas leitura do que foi preenchido no onboarding).  
   - **Treino:** exibir `summary.weekly_training` (lista de dias com tipo e descrição).  
   - **Alimentação:** exibir `summary.suggested_meals` e `summary.daily_targets` (resumo do plano de refeições e metas diárias).  
   - Usar `when`/`maybeWhen` para Loading, Data e Error em cada aba que depender do weeklyPlanProvider.

4. **Fluxo “gerar plano”**  
   - Conforme **ADR-003:** tela intermediária “Gerar meu plano” com CTA → POST /plans/weekly → 201 → 3 abas; onboarding completo = profile + goals enviados.

### 2.5 Fase 4 – Testes e BDD

- **Providers:** testes unitários com `ProviderContainer.test()`, overrides para repositório e cliente HTTP; validar estados iniciais e transições (Loading → Data / Error).  
- **Widgets:** override de providers; garantir que todos os estados (Loading, Data, Error) sejam renderizados (when/maybeWhen).  
- **Integração/BDD:** cenários como SCN-ONB-BIOTIPO-VISUAL (envio de body_fat_visual_id e efeito na UI); SCN-AUTH-BLOQUEIO-FALHAS (429 após 5 falhas); usar mocks da API ou backend de teste conforme definido no projeto.

### 2.6 Ordem sugerida de execução

1. ~~Obter AGENTS.md~~ **Feito.** Dúvidas resolvidas em **ADR-003** e **AGENTS.md**.  
2. **Fase 1** (fundação + auth + telas de login/signup/forgot/reset).  
3. **Fase 2** (onboarding completo, Passo 4 em esqueleto conforme ADR-003).  
4. **Fase 3** (tela “Gerar meu plano” → POST /plans/weekly → 3 abas).  
5. **Fase 4** (testes unitários e BDD dos fluxos críticos).

---

## 3. Dúvidas – Respostas (decisões registradas)

Todas as dúvidas foram resolvidas. **Decisões oficiais:** `docs/adr/ADR-003-decisoes-frontend-epico1.md`.

| # | Dúvida | Resposta |
|---|--------|----------|
| 1 | AGENTS.md | **Resolvido.** Manifesto criado na raiz (`AGENTS.md`) com diretórios, pinagem e regras. |
| 2 | Modelos Freezed | **ADR-003:** Frontend deriva modelos de `docs/backend/contratos-frontend.md`; fonte de verdade até handoff do Arquiteto. |
| 3 | Diretório do app | **AGENTS.md §2.2:** Raiz em `app/`; estrutura `lib/core`, `lib/features/auth|onboarding|plans`, `lib/shared`. |
| 4 | Preferências (Passo 4) | **ADR-003:** UI esqueleto, sem persistência; usuário pode avançar; quando houver contrato (endpoint/campo), Frontend passa a enviar. |
| 5 | Fluxo “gerar plano” / onboarding completo | **ADR-003:** Tela intermediária “Gerar meu plano” com CTA → POST /plans/weekly → 201 → 3 abas. Onboarding completo = profile + goals enviados (estado local; 422 = incompleto). Rota inicial: token + onboarding completo → Home; token sem completo → onboarding; sem token → Login. |
| 6 | Refresh token | **ADR-003:** Épico 1 sem refresh; 401 → deslogar e redirecionar para Login. |
| 7 | Deep link / reset senha | **ADR-003:** Suportar token na URL (deep link ou web) e token colado pelo usuário; campo nova senha obrigatório. |

---

## 4. Checklist de prontidão (Frontend)

Quando o Épico 1 estiver implementado, o Frontend considerará concluído quando:

- [ ] Fluxo de login, signup, forgot-password e reset-password implementado e alinhado a `contratos-frontend.md`.
- [ ] Onboarding em 4 passos (dados básicos, % gordura com opção biotipo visual, metas, preferências) com PUT profile e PUT goals; 422 tratado com mensagem clara.
- [ ] POST /plans/weekly chamado após onboarding; resposta exibida nas 3 abas (Perfil, Treino, Alimentação) com tratamento Loading/Data/Error.
- [ ] Estado global em Riverpod + Freezed; UI com `when`/`maybeWhen` para todos os estados; sem ref.read no build para estado que atualiza tela; JWT em flutter_secure_storage.
- [ ] Testes relevantes (providers, widgets, BDD quando aplicável) presentes.
- [ ] Código dentro da árvore de diretórios definida em AGENTS.md; dependências conforme pinagem do Arquiteto.

---

*Documento vivo: deve ser atualizado quando o Arquiteto responder às dúvidas ou quando novos contratos (ex.: preferências de treino) forem definidos.*
