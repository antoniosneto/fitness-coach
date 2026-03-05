# Passagem do code review ao Arquiteto e conversa Arquiteto ↔ Backend (sugestões)

**Documento de referência:** [CODE-REVIEW-PR-plans-weekly.md](CODE-REVIEW-PR-plans-weekly.md)  
**Data:** 2026-03-05  
**Participantes:** Agente Arquiteto (`agents/arquiteto-software.md`), Agente Backend (`agents/backend.md`).

---

## 1. Posição do Arquiteto após receber o code review

O **Agente Arquiteto** recebeu o documento de code review do PR *feature/plans-weekly* e manifesta o seguinte:

- **Validação do review:** O checklist está alinhado aos critérios que defino (contratos, módulos por domínio, sem @Global(), controller orquestrando, multi-tenancy, soft delete). Aprovado como **aprovado com ressalvas**.
- **Ressalva aceita:** A ausência da estrutura de treino semanal (SCN-TRAIN-ROTINA-MAQUINAS) neste PR é aceitável como primeiro incremento. O refinamento já prevê evolução do plano (alimentação primeiro; treino em seguida). Nenhum contrato (OpenAPI, DTO, schema) foi violado.
- **Manifesto de diretórios:** O módulo `backend/src/modules/plan/` com `services/goals-motor.service.ts` e `dto/` está conforme o manifesto (módulos por domínio, sem arquivos fora da árvore permitida).
- **Sugestões do review:** As três sugestões (Postman 422, idade mínima, estrutura de treino) são não bloqueantes. Defino abaixo, em conversa com o Backend, o que implementamos **neste ciclo** e o que fica para **próximo incremento**.

---

## 2. Conversa Arquiteto ↔ Backend sobre as sugestões

**Arquiteto:** O review sugeriu três itens: (1) request Postman “expect 422” para POST Plans Weekly, (2) documentar a regra de idade mínima no Motor de Metas, (3) estrutura de treino em PR futuro. O que vocês propõem implementar antes de fechar este PR?

**Backend:** Proponho implementar **neste PR** os itens (1) e (2):  
- **(1) Postman 422:** Incluir um request “POST Plans Weekly (expect 422)” na collection. Para isso precisamos de um cenário reproduzível: por exemplo, um segundo usuário que fez login mas não completou profile/goals, ou documentar que o teste 422 deve ser rodado manualmente (ex.: deletar temporariamente o goal do usuário). O request pode usar o mesmo token após limpar metas no banco, ou podemos usar um usuário alternativo (signup com outro email, login, chamar POST weekly sem ter feito profile/goals). Implemento o request com body vazio e header Authorization; o script de teste valida status 422 e que `message` fala de onboarding incompleto.  
- **(2) Idade mínima:** Documentar no próprio `GoalsMotorService` (comentário JSDoc ou bloco acima de `getAgeYears`) que a idade é limitada a mínimo 18 anos para o cálculo de BMR/GCT, por decisão de produto/arquitetura (evitar BMR irreal para menores ou datas incorretas). Se o Arquiteto preferir, posso propor um ADR curto em `docs/adr/` em vez de só comentário no código.

O item **(3) estrutura de treino** deixamos para PR futuro, conforme já acordado (SCN-TRAIN-ROTINA-MAQUINAS em incremento dedicado).

**Arquiteto:** De acordo.  
- **(1)** Implementar o request Postman “POST Plans Weekly (expect 422)”. O cenário pode ser: usuário que fez signup + login mas **não** fez PUT profile nem PUT goals. Para isso, na collection, podemos ter uma pasta ou request opcional que use um segundo usuário (ex.: `teste422@email.com`) com signup + login e em seguida POST weekly — esperado 422. Ou, se for mais simples, um request que documente “rodar após garantir que o usuário atual não tem perfil ou metas” e valide 422. Fico com a opção de **segundo usuário** (signup, login, POST weekly sem profile/goals) para ser reproduzível sem mexer no banco.  
- **(2)** Documentar a idade mínima no código (comentário no `GoalsMotorService`) é suficiente por agora. Não é necessário ADR só para isso; se no futuro surgir regra de negócio mais complexa (ex.: faixas etárias diferentes), aí sim um ADR.  
- **(3)** Fica para PR futuro; sem alteração de contrato neste PR.

**Backend:** Entendido. Resumo do que implemento **neste ciclo**:
1. Novo request na collection Postman: “POST Plans Weekly (expect 422)” — fluxo com segundo usuário (Signup 422 user → Login 422 user → POST Plans Weekly com esse token → esperado 422, com testes validando status e `message`).
2. Comentário no `GoalsMotorService` (função `getAgeYears` ou no topo do serviço) documentando que a idade utilizada no cálculo de BMR/GCT é limitada a mínimo 18 anos.

**(3)** Estrutura de treino: não implementar neste PR; permanece como sugestão para PR futuro.

**Arquiteto:** Confirmado. Podem seguir com commit e PR após essas duas alterações.

---

## 3. O que implementar agora (acordado Arquiteto + Backend)

| # | Sugestão do code review | Decisão | Responsável |
|---|--------------------------|---------|-------------|
| 1 | Cenário 422 no Postman | **Implementar neste PR.** Request “POST Plans Weekly (expect 422)” com fluxo de segundo usuário (signup + login sem profile/goals, depois POST weekly → 422). Script de teste valida status 422 e corpo com `message` sobre onboarding incompleto. | Backend |
| 2 | Idade mínima (documentar) | **Implementar neste PR.** Comentário no código em `GoalsMotorService` (getAgeYears ou bloco do serviço) explicando que a idade usada no cálculo BMR/GCT tem mínimo 18 anos. Sem ADR por ora. | Backend |
| 3 | Estrutura de treino (SCN-TRAIN-ROTINA-MAQUINAS) | **Não implementar neste PR.** Fica para PR futuro; sem mudança de contrato neste ciclo. | Backend (próximo incremento) |

---

## 4. Resumo para o time

- O **code review** foi passado ao **Arquiteto**, que validou o conteúdo e aceitou a ressalva sobre treino semanal.
- Em conversa **Arquiteto ↔ Backend**, ficou acordado implementar **neste PR**:
  - Request Postman **“POST Plans Weekly (expect 422)”** (segundo usuário sem onboarding completo).
  - **Documentação no código** da regra de idade mínima (18 anos) no Motor de Metas.
- A **estrutura de treino semanal** (SCN-TRAIN-ROTINA-MAQUINAS) permanece como sugestão para **próximo PR**.

Após a implementação dos itens 1 e 2, o Backend pode prosseguir com commit e abertura do PR.
