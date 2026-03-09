# Documentação do Frontend

Documentação autocontida do app Flutter (pasta `app/`). Permite que Backend, Arquiteto e PM entendam a aplicação sem ler o código.

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [arquitetura.md](./arquitetura.md) | Stack, estrutura de pastas, convenções |
| [telas-e-fluxos.md](./telas-e-fluxos.md) | Telas, rotas, fluxos e endpoints por tela |
| [modelos-e-estado.md](./modelos-e-estado.md) | Modelos Freezed, estados e providers |
| [ambiente-e-contratos.md](./ambiente-e-contratos.md) | Variáveis de ambiente e referência aos contratos do backend |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de atualizações desta documentação |

## Como usar

- **Backend:** use `telas-e-fluxos.md` e `ambiente-e-contratos.md` para saber quais endpoints o app consome e em qual fluxo.
- **Arquiteto:** use `arquitetura.md` e `modelos-e-estado.md` para visão da estrutura e do estado.
- **PM / outros:** use `telas-e-fluxos.md` para entender telas e fluxos de usuário.

Toda informação reflete o **estado atual** do código em `app/lib/`; não há “a implementar” aqui.
