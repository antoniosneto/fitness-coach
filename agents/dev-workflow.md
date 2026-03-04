## Fluxo de Trabalho Multi‑Agentes (DBA, Backend, Frontend)

Este documento define o **fluxo obrigatório de desenvolvimento** para os agentes **DBA**, **Backend** e **Frontend** neste projeto.

- **Escopo**: vale para qualquer entrega relacionada aos épicos descritos em `PRD/*.md` e seus refinamentos técnicos.
- **Tamanho máximo de entrega**: cada Pull Request deve conter **no máximo ~500 linhas modificadas** (soma de adições + remoções) para manter code review eficiente.

---

## Passos obrigatórios por entrega

1. **Alinhamento de contexto**
   - Ler:
     - `objective.md`;
     - o PRD relevante (ex.: `PRD/prd-001-auth-onboarding-metas.md`);
     - o refinamento técnico correspondente (ex.: `refinamentos técnicos/refinamento-tecnico-001-auth-onboarding-metas.md`);
     - o arquivo do seu agente:
       - DBA: `agents/dba.md` (quando existir),
       - Backend: `agents/backend.md`,
       - Frontend: `agents/frontend.md` (quando existir).

2. **Planejamento da pequena entrega**
   - Quebrar o trabalho em **pequenos incrementos** que gerem um PR de até ~500 linhas.
   - Garantir que o incremento tenha:
     - escopo claro (ex.: “apenas endpoints de signup/login”),
     - critérios de aceite diretamente rastreáveis a requisitos `REQ-*` e/ou cenários `SCN-*` do PRD.

3. **Criação da branch**
   - A partir da branch principal (`master` ou `main`, conforme definido pelo Arquiteto):
     - atualizar a branch local da principal,
     - criar uma branch de feature com nome descritivo, por exemplo:
       - `feature/auth-signup-login`,
       - `feature/onboarding-profile`,
       - `feature/plan-weekly-generation`.

4. **Implementação e testes locais**
   - Desenvolver **somente** o escopo planejado para este PR.
   - Garantir que:
     - testes unitários e de integração/e2e relevantes passem localmente;
     - não haja lints/erros básicos pendentes.

5. **Abertura do Pull Request**
   - Abrir PR da branch de feature para `master/main`.
   - Descrever no PR:
     - **qual PRD** e **qual refinamento técnico** estão sendo implementados;
     - quais requisitos `REQ-*` e cenários `SCN-*` são cobertos;
     - tamanho aproximado em linhas modificadas (mantendo o limite de ~500 linhas).

6. **Code Review pelo Agente Arquiteto**
   - O PR deve solicitar revisão explícita do **Agente Arquiteto** (`agents/arquiteto-software.md`), que analisará:
     - aderência estrita aos contratos (OpenAPI, Prisma Schema, DTOs, modelos Freezed, ADRs);
     - respeito às decisões de arquitetura, multi‑tenancy, segurança, soft delete e NFRs;
     - organização de módulos, camadas e responsabilidades.

7. **Revisão de Produto pelo Agente Product Manager**
   - O PR também deve solicitar opinião/revisão do **Agente Product Manager** (`agents/product-manager.md`), que avaliará:
     - se o comportamento implementado corresponde ao PRD (regras de negócio, BDD, fluxos do usuário);
     - se os critérios de sucesso foram respeitados;
     - se há impactos funcionais não previstos.

8. **Ajustes pós‑review**
   - O agente executor (DBA/Backend/Frontend) deve:
     - aplicar ajustes solicitados pelo Arquiteto e/ou Product Manager;
     - garantir que os testes continuem passando.

9. **Merge controlado**
   - Somente após:
     - aprovação do **Agente Arquiteto**, e
     - aceite/opinião positiva do **Agente Product Manager**,
   - o PR pode ser mesclado na branch principal (`master/main`).

---

## Fluxograma em Mermaid

```mermaid
flowchart TD
    A[Início: nova tarefa do PRD] --> B[Ler objective.md, PRD e refinamento técnico]
    B --> C[Planejar pequena entrega<br/>(PR ≤ ~500 linhas)]
    C --> D[Criar branch a partir da master/main]
    D --> E[Implementar mudança<br/>+ escrever/rodar testes]
    E --> F[Abrir Pull Request]
    F --> G[Review técnico<br/>Agente Arquiteto]
    F --> H[Review de produto<br/>Agente Product Manager]
    G --> I{Ajustes necessários?}
    H --> I
    I -->|Sim| J[Aplicar ajustes e atualizar PR]
    J --> F
    I -->|Não| K[Aprovação conjunta]
    K --> L[Merge na master/main]
    L --> M[Fim da entrega<br/>Próxima pequena tarefa]
```

---

## Regras adicionais

- **Nenhum agente** (DBA, Backend, Frontend) deve:
  - introduzir mudanças grandes que não caibam em PRs de até ~500 linhas;
  - mesclar código diretamente na branch principal sem PR e sem review.
- Em caso de necessidade de alteração de contratos globais (OpenAPI, Prisma, ADRs, `AGENTS.md`):
  - abrir uma tarefa específica para o **Agente Arquiteto**,
  - aguardar novos artefatos de arquitetura antes de implementar.

