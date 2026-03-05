# Prompt para Deep Research – Agente Frontend (Gemini)

Use o texto abaixo no Gemini para gerar um documento completo com todas as **hard skills** que o agente Frontend precisa dominar. Substitua os blocos `<<<...>>>` pelo conteúdo real dos arquivos indicados (ou por um resumo fiel).

---

## Texto do prompt (copiar e colar)

```
Você é um pesquisador técnico sênior especializado em desenvolvimento mobile com Flutter, arquitetura reativa, gestão de estado e integração com APIs REST (até 2026).

Vou te fornecer o contexto de produto, um PRD técnico e um refinamento técnico de arquitetura. Seu trabalho é produzir um documento de deep research extremamente completo listando TODAS as **hard skills** que um agente Frontend (IA especializada em Flutter mobile) precisa dominar para implementar, com qualidade de nível sênior, o Épico 1 do nosso produto no **app Android**.

Esse documento será usado como base para criar o **System Prompt** de um agente Frontend que escreverá código sozinho. Portanto, preciso de uma visão **exaustiva, prática e opinativa** sobre as hard skills necessárias.

--------------------------------
## 1. Contexto do produto

OBJECTIVE:

<<<COLE AQUI O CONTEÚDO DO `objective.md` OU UM RESUMO FIEL>>>

Pontos-chave:
- App na palma da mão para definir dieta e treinos semanais com base em objetivos.
- Desenvolvimento 100% por IA; frontend segue documentação do Arquiteto e refinamentos técnicos.
- App mobile Android; API isolada e reutilizável (whitelabel no futuro).
- Fluxos: Login, Cadastro, Recuperação de senha, Onboarding (dados biométricos + metas + preferências), três abas (Perfil, Treino, Alimentação).

--------------------------------
## 2. PRD técnico do Épico 1

PRD – Autenticação, Onboarding e Metas:

<<<COLE AQUI O CONTEÚDO (OU UM RESUMO FIEL) DE `PRD/prd-001-auth-onboarding-metas.md`>>>

Pontos-chave para o Frontend:
- Contratos OpenAPI (signup, login, onboarding/profile, onboarding/goals, plans/weekly).
- Cenários BDD que impactam UI: SCN-AUTH-BLOQUEIO-FALHAS, SCN-ONB-BIOTIPO-VISUAL, SCN-GOAL-METAS-MEDIUM, SCN-TRAIN-ROTINA-MAQUINAS, SCN-UI-ABAS-SEMANAIS.
- NFRs: NFR-UX-001 (transições P95 < 200ms), tratamento de 401, 422, 429, fluxo de onboarding em múltiplos passos.

--------------------------------
## 3. Refinamento técnico – Instruções para o Agente Frontend

Refinamento Técnico – `refinamento-tecnico-001-auth-onboarding-metas.md` (seção 4):

<<<COLE AQUI A SEÇÃO "4. Instruções para o Agente Frontend (Flutter + Riverpod + Freezed)" DO REFINAMENTO TÉCNICO>>>

Resumo da stack e responsabilidades do Frontend:
- **Flutter** (app Android).
- **Riverpod** para gestão de estado (NotifierProvider, AsyncNotifierProvider).
- **Freezed** para modelos imutáveis e estados de tela (uniões de tipos: Loading, Data, Error).
- **ConsumerWidget / HookConsumerWidget** com WidgetRef para consumo de estado.
- Proibição de StatefulWidget para regra de negócio e setState para estado global.
- Fluxos: Login, Signup, Onboarding (dados básicos → % gordura → metas → preferências), três abas (Perfil, Treino, Alimentação).
- Cliente HTTP com JWT (armazenamento seguro, Authorization: Bearer), tratamento de 401, 422, 429.
- body_fat_visual_id enviado ao backend; nenhum cálculo de % gordura no frontend.
- NFRs de UX: transições fluidas (< 200ms P95), loaders, mensagens de erro claras.

--------------------------------
## 4. Governança do Agente Arquiteto para o Frontend

Do arquivo `agents/arquiteto-software.md` (seção 5.3):

<<<COLE AQUI A SEÇÃO "5.3. Agente Frontend (Flutter + Riverpod + Freezed)" DO ARQUITETO>>>

Resumo: interditar StatefulWidget/setState para lógica; exigir Riverpod + Freezed; ConsumerWidget/HookConsumerWidget + WidgetRef; especificar estados, eventos e mapeamento DTO ↔ Freezed por tela.

--------------------------------
## 5. Objetivo do deep research

Com base em TODO o material acima, produza um documento de deep research que responda:

"Quais são TODAS as hard skills que um agente Frontend, especializado em Flutter + Riverpod + Freezed para Android, precisa dominar para implementar **perfeitamente** o Épico 1 (autenticação, onboarding multi-etapas e abas Perfil/Treino/Alimentação) desse produto, seguindo as melhores práticas modernas (até 2026)?"

Foque **apenas** em hard skills de Frontend mobile (não inclua backend ou DBA, exceto o que for necessário para integração com a API e entendimento dos contratos).

--------------------------------
## 6. Escopo mínimo das hard skills

Garanta que o documento cubra, no mínimo, as seguintes dimensões para o agente Frontend:

1. **Flutter e Dart aplicados ao produto**
   - Estrutura de projeto por features (auth, onboarding, plans, shared).
   - Widgets: StatelessWidget vs ConsumerWidget/HookConsumerWidget; quando usar cada um; proibição de StatefulWidget para lógica de negócio.
   - Navegação: rotas nomeadas, go_router ou Navigator 2.0; fluxo Login → Onboarding → Home com abas.
   - Ciclo de vida e rebuilds; como evitar rebuilds desnecessários (select, ref.watch vs ref.read).

2. **Riverpod em profundidade**
   - Provider, NotifierProvider, AsyncNotifierProvider; quando usar cada tipo.
   - Escopo (global vs família vs autoDispose); sobrevivência de estado entre telas.
   - Padrões para auth: estados Unauthenticated, Authenticating, Authenticated, AuthError; persistência de token.
   - Padrões para onboarding: estado multi-etapas, dados temporários do formulário, erros de validação por passo.
   - Padrões para dados assíncronos (plano semanal): Loading, Data, Error; invalidação e refetch.
   - Testabilidade: override em testes, mocking de providers.

3. **Freezed e modelagem imutável**
   - Classes de dados (@freezed): modelos de domínio (User, UserProfile, Goal, WeeklyPlan, etc.) alinhados aos DTOs da API.
   - Uniões de tipos (sealed/union) para estados de tela: ex. AuthState = Unauthenticated | Authenticating | Authenticated | AuthError.
   - copyWith, equals, toString; quando gerar JSON (toJson/fromJson) para requests/responses.
   - Regra: UI deve usar when/maybeWhen para cobrir todos os estados; proibição de estados impossíveis e de var em modelos.

4. **Integração com API REST**
   - Cliente HTTP (dio, http ou equivalente): interceptors para JWT (Authorization: Bearer), baseUrl, timeout.
   - Armazenamento seguro do token no Android (flutter_secure_storage ou equivalente); quando anexar e quando limpar.
   - Mapeamento request: modelo Freezed/Dart → JSON conforme OpenAPI (campos, enums, datas em ISO).
   - Mapeamento response: JSON → modelo Freezed; tratamento de erros (401, 409, 422, 429) com mensagens amigáveis.
   - Cenário body_fat_visual_id: enviar apenas o identificador; não calcular percentual no app.
   - Idempotência e retry; feedback de loading e erro na UI.

5. **UX e performance (NFRs)**
   - Transições de tela e animações: como atingir P95 < 200ms; uso de const, keys, listas eficientes.
   - Onboarding fluido: formulários multi-passo sem travar; validação por passo; navegação entre passos.
   - Acessibilidade e feedback: loaders, mensagens de erro claras (401, 422, 429), estados vazios.
   - Boas práticas de UI em Android (Material 3, temas, acessibilidade básica).

6. **Segurança no cliente**
   - Não armazenar senha em texto; não logar token ou PII.
   - Armazenamento seguro do JWT; limpeza em logout e em 401.
   - Comunicação HTTPS; certificados em produção.

7. **Testes (unitários, widget, integração)**
   - Testes de providers (Riverpod): estados iniciais, transições, erro.
   - Testes de widgets: ConsumerWidget com provider override; golden ou snapshot se aplicável.
   - Testes de integração: fluxo de login, onboarding (mock da API ou teste contra backend de teste); cenários BDD que envolvem UI (ex.: SCN-ONB-BIOTIPO-VISUAL do ponto de vista do app).
   - Ferramentas: flutter_test, mocktail/ mockito, integration_test.

8. **Organização de código e convenções**
   - Pastas: features (auth, onboarding, plans), core (api, router, theme), shared (widgets, models).
   - Nomenclatura: arquivos, classes, providers; convenções de nomenclatura para estados Freezed.
   - Injeção de dependências: repositórios e clientes HTTP via Riverpod; testabilidade.

9. **Tratamento de erros e bordas**
   - Rede indisponível, timeout, 5xx.
   - 401 (logout ou refresh), 409 (email já usado), 422 (metas inválidas), 429 (tente mais tarde).
   - Validação de formulário no cliente vs mensagens do backend; quando mostrar cada uma.

10. **Compatibilidade e tooling**
    - Versão mínima do Flutter/Dart; suporte a Android conforme objective.md.
    - pubspec: versões fixas (sem ^) conforme governança do Arquiteto; dependências de Riverpod, Freezed, json_serializable, cliente HTTP, secure storage.
    - Lint e formatação (analysis_options.yaml, dart format); CI para testes.

--------------------------------
## 7. Forma do resultado esperado

Estruture a sua resposta em seções claras, por exemplo:

1. **Visão Geral do Agente Frontend**
2. **Mapa de Hard Skills – Visão Macro**
3. **Hard Skills por Dimensão**
   - Para cada dimensão (Flutter/Dart, Riverpod, Freezed, API, UX, Segurança, Testes, etc.):
     - descrição da competência;
     - por que é crítica para ESTE produto/épico;
     - exemplos concretos do que o agente precisa ser capaz de fazer.
4. **Anti-padrões e Riscos Específicos**
   - Lista de erros comuns (ex.: usar setState para auth, não tratar todos os estados no when, armazenar token em SharedPreferences sem criptografia) e como evitá-los no contexto deste produto.
5. **Checklist de Prontidão do Agente Frontend**
   - Lista objetiva para sabermos se o agente tem as hard skills "no ponto" para implementar o Épico 1.

Use linguagem técnica, direta, e exemplos concretos sempre que possível. Priorize conteúdo prático e aplicável sobre descrição genérica de tecnologias.
```

---

## Uso

1. Abra `objective.md`, `PRD/prd-001-auth-onboarding-metas.md`, `refinamentos técnicos/refinamento-tecnico-001-auth-onboarding-metas.md` e `agents/arquiteto-software.md`.
2. Substitua cada bloco `<<<...>>>` pelo texto correspondente (ou por um resumo fiel que preserve requisitos e contratos).
3. Cole o prompt completo no Gemini.
4. Salve a resposta do Gemini em `deep research/frontend.md` (ou outro nome combinado) para usar na criação do agente Frontend (`agents/frontend.md`).
