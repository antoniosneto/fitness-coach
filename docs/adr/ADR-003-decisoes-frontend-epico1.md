# ADR-003: Decisões para o Frontend – Épico 1 (dúvidas resolvidas)

**Status:** Aceito  
**Decisores:** Arquiteto (governança), alinhado a PM, Backend e Frontend  
**Data:** 2026-03-05  
**Contexto:** O Agente Frontend levantou 7 dúvidas em `docs/PLANO-FRONTEND-EPICO1.md` (seção 3). As dúvidas 1 e 3 foram resolvidas pela criação do `AGENTS.md`. Este ADR registra as decisões para as dúvidas 2, 4, 5, 6 e 7.

---

## Decisões

### Dúvida 2 – Modelos Freezed (Dart)

- **Decisão:** O Frontend **pode derivar** os modelos Freezed (request/response e estados de tela) **exclusivamente de `docs/backend/contratos-frontend.md`**.
- **Fonte de verdade** para tipos de request e response no Épico 1 é `contratos-frontend.md`. O Arquiteto não entregará artefatos Freezed gerados neste épico; se no futuro o Arquiteto gerar modelos Freezed (ex.: via ferramenta ou handoff explícito), esses artefatos passarão a ser a referência e o Frontend alinhará a eles.
- **Consequência:** O Frontend implementa os modelos em Dart (Freezed + json_serializable) espelhando nomes, tipos e enums do documento de contratos; qualquer divergência entre contrato e código deve ser tratada como bug.

---

### Dúvida 4 – Preferências de treino/esportes (Passo 4 do onboarding)

- **Decisão:** Opção **(b)** – Deixar a tela de preferências como **esqueleto (UI pronta, sem persistência)** até o Arquiteto/Backend definirem o contrato (endpoints ou campos em perfil/metas).
- **Comportamento no Épico 1:**
  - O Frontend exibe o **Passo 4** do onboarding com UI mínima (ex.: título “Preferências de treino e esportes”, placeholder ou checkbox “Priorizar exercícios em máquinas” sem envio à API).
  - O usuário pode **avançar** sem preencher dados que não tenham destino no backend. Nenhum campo de preferência é enviado em PUT profile ou PUT goals até que exista campo/endpoint definido em contrato.
  - O backend já retorna `machines_only` no `summary` do POST /plans/weekly; esse valor vem da lógica interna atual. Quando o contrato de preferências existir, o Frontend passará a enviar e o backend a persistir/consumir.
- **Consequência:** O fluxo de onboarding permanece com 4 passos navegáveis; o Passo 4 não bloqueia a geração do plano; em épico futuro, o Frontend adiciona persistência assim que o contrato for publicado em `contratos-frontend.md` ou ADR.

---

### Dúvida 5 – Fluxo “gerar plano” e rota pós-onboarding

- **Decisão:**
  - **Fluxo:** Após o usuário concluir o **Passo 4** do onboarding, exibir **uma tela intermediária “Gerar meu plano”** (ou equivalente) com um **CTA** (ex.: botão “Gerar meu plano”) que chama POST /plans/weekly. Em 201, navegar para o container com as **3 abas** (Perfil, Treino, Alimentação). Em 422, exibir mensagem “Dados de onboarding incompletos…” e permitir retorno aos passos (perfil/metas).
  - **Onboarding completo:** Considera-se onboarding completo quando **PUT /onboarding/profile** e **PUT /onboarding/goals** tiverem sido chamados com sucesso (pelo menos uma vez) na sessão atual ou em sessão anterior. O Frontend pode inferir isso por: (1) estado local (ex.: provider que guarda “profileSubmitted” e “goalsSubmitted” após sucesso dos PUTs), ou (2) ao chamar POST /plans/weekly, se retornar 422, tratar como “onboarding incompleto” e redirecionar para o passo faltante (perfil ou metas). Não é obrigatório chamar um endpoint “GET onboarding/status” no Épico 1; se o backend introduzir esse endpoint depois, o Frontend pode passará a usá-lo para decidir Login vs Onboarding vs Home.
  - **Rota inicial (app):** Se há token válido e o Frontend considera onboarding completo (profile + goals enviados) → ir para Home (3 abas). Se há token mas onboarding incompleto → ir para onboarding (passo 1 ou passo já em progresso). Se não há token → Login (ou Signup).

---

### Dúvida 6 – Refresh token

- **Decisão:** No Épico 1 **não há** endpoint de refresh token definido no PRD nem no refinamento. Em resposta **401** (Unauthorized), o Frontend deve **deslogar** (limpar token do armazenamento seguro e estado de auth) e **redirecionar para a tela de Login**.
- Se no futuro o Arquiteto definir fluxo de refresh token (ADR + endpoint), o Frontend será atualizado para tentar renovar o token antes de deslogar; até lá, 401 implica logout imediato.

---

### Dúvida 7 – Deep link / reset de senha

- **Decisão:** O link no e-mail de recuperação de senha pode ser **URL web** (ex.: `https://app.example.com/reset-password?token=...`) ou **deep link do app** (ex.: `myapp://reset-password?token=...`). A escolha depende do ambiente (web vs app nativo) e da configuração do provedor de e-mail (ADR-002).
- **Comportamento do Frontend:** A tela de reset de senha deve suportar **ambos** os cenários na medida do possível:
   - **Token na URL / deep link:** Se o app for aberto com query `token` (ex.: `myapp://reset-password?token=xyz` ou rota `/reset-password?token=xyz`), o Frontend **lê o token da URL** e pré-preenche (ou usa em memória) para a chamada POST /auth/reset-password; o usuário informa apenas a nova senha.
   - **Token colado:** Se o usuário abrir a tela sem token na URL (ex.: navegação manual), exibir **campo opcional “Token”** (ou “Código do e-mail”) onde o usuário pode colar o valor recebido no e-mail; campo **new_password** obrigatório. Assim o fluxo funciona tanto com deep link quanto com link web que abre o app por intent (Android) passando o token, ou com usuário colando o token.
- **Recomendação para produção:** Registrar em ADR ou configuração do projeto qual esquema de link será usado (web vs deep link) para o e-mail de reset; o Frontend já fica preparado para os dois casos.

---

## Resumo para o Frontend

| Dúvida | Decisão |
|--------|---------|
| 2 – Modelos Freezed | Derivar de `docs/backend/contratos-frontend.md`; fonte de verdade até eventual handoff do Arquiteto. |
| 4 – Preferências Passo 4 | UI esqueleto, sem persistência; avançar sem enviar preferências até haver contrato. |
| 5 – Gerar plano / onboarding completo | Tela intermediária “Gerar meu plano” → POST /plans/weekly → 201 → 3 abas. Onboarding completo = profile + goals enviados (estado local ou 422 como sinal de incompleto). |
| 6 – Refresh token | Não há refresh no Épico 1; 401 → deslogar e ir para Login. |
| 7 – Deep link reset senha | Suportar token na URL e token colado; campo nova senha obrigatório. |

---

## Consequências

- O Frontend pode prosseguir com a implementação das Fases 1 a 4 do `docs/PLANO-FRONTEND-EPICO1.md` sem novas dúvidas bloqueantes para o Épico 1.
- Alterações futuras (preferências persistidas, refresh token, esquema oficial de link de reset) serão registradas em novo ADR ou atualização de `contratos-frontend.md`.
