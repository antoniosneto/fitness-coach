# Fitness Coach – API e App

Projeto multi-agentes para um app Android que ajuda a definir **dieta semanal** e **treinos semanais** com base em objetivos e preferências.

- **Objetivo e premissas:** [objective.md](objective.md)
- **PRDs:** pasta [PRD/](PRD/)
- **Refinamentos técnicos:** pasta [refinamentos técnicos/](refinamentos%20técnicos/)
- **Fluxo de trabalho (DBA, Backend, Frontend, Documentador):** [agents/dev-workflow.md](agents/dev-workflow.md)
- **Documentação do backend (Frontend/DBA/Arquiteto):** [docs/backend/](docs/backend/)

## Estrutura

- **backend/** – API NestJS + Prisma + PostgreSQL (Épico 1 em andamento)
- **docs/backend/** – Documentação atual do backend (mantida pelo Agente Documentador)
- **agents/** – Definições dos agentes (Arquiteto, Backend, Documentador, PM, etc.)

## Como contribuir

Siga o fluxo em [agents/dev-workflow.md](agents/dev-workflow.md): branches a partir de `main`, PRs ≤ ~500 linhas, code review pelo Arquiteto e pelo Product Manager.
