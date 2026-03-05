**Objetivo:** Um software, na palma da mão, que me auxilia a definir minha dieta da semana e meus treinos da semana, baseado nos meus objetivos.

**Premissas do projeto:** 

- É um projeto que será desenvolvido 100% por IA.
- A partir de um documento estruturado, com o plano de negócio, teremos um agente Product Manager que será responsável por entender todo o projeto e transformar o projeto em um roadmap com documentação clara de cada entrega;
- Teremos o agente arquiteto que pegará a solução proposta e criará sua documentação técnica, definindo as bases arquiteturais do software, responsabilidades do backend, responsabilidades do frontend, comportamento e alterações necessárias no banco de dados, inputs exigidos pelo backend e formato de resposta exigido pelo frontend.
- Teremos os agentes de backend, frontend e DBA - Database Administrator. A função desses agentes é escrever código seguindo a arquitetura e regras propostas pelo agente arquiteto. Além disso, eles são os responsáveis por escrever testes unitários e de integração.

**Conhecimentos necessários para cada agente**

- Agente Product Manager: Scrum; Lean manifacturing; The Lean Startup de Eric Ries; metodologia BDD(Behavior‑Driven Development) e framework **Given-When-Then**(*Dado-Quando-Então*); PRD(Product Requirements Document (PRD));
- Agente arquiteto de software: Arquitetura de software; clean code; monolith vs microservices architecture; nodeJS, Python, C Sharp, Kotlin, Flutter, React Native; segurança de software; comunicação frontend e backend; performance de software; OTP frameworks; soft delete x hard delete, TDD ([Test-Driven Development](https://www.google.com/search?q=Test-Driven+Development&oq=tdd&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIMCAEQABhDGIAEGIoFMgwIAhAjGCcYgAQYigUyDQgDEAAYkQIYgAQYigUyDAgEEAAYQxiABBiKBTIGCAUQRRg8MgYIBhBFGDwyBggHEEUYPNIBCDQwMDJqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwjz8pqGz4aTAxX2npUCHWDmKQ0QgK4QegYIAAgAEAM));
- Agente backend: NodeJs, Python, C Sharp, clean code, git to *save and manage different versions of your files and code,* backend **testing frameworks; segurança de software; comunicação frontend e backend; performance de software, TDD ([Test-Driven Development](https://www.google.com/search?q=Test-Driven+Development&oq=tdd&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIMCAEQABhDGIAEGIoFMgwIAhAjGCcYgAQYigUyDQgDEAAYkQIYgAQYigUyDAgEEAAYQxiABBiKBTIGCAUQRRg8MgYIBhBFGDwyBggHEEUYPNIBCDQwMDJqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwjz8pqGz4aTAxX2npUCHWDmKQ0QgK4QegYIAAgAEAM));
- Agente frontend: Flutter, React Native, Kotlin, frontend mobile frameworks, UX/UI design best practices, segurança de software; comunicação frontend e backend; performance de software; clean code, git to *save and manage different versions of your files and code,* frontend mobile **testing frameworks, TDD ([Test-Driven Development](https://www.google.com/search?q=Test-Driven+Development&oq=tdd&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIMCAEQABhDGIAEGIoFMgwIAhAjGCcYgAQYigUyDQgDEAAYkQIYgAQYigUyDAgEEAAYQxiABBiKBTIGCAUQRRg8MgYIBhBFGDwyBggHEEUYPNIBCDQwMDJqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwjz8pqGz4aTAxX2npUCHWDmKQ0QgK4QegYIAAgAEAM));
- Agente DBA - Database Administrator: Precisam conhecer tudo sobre banco de dados, segurança, boas práticas, OTP frameworks, JOIN, Select, Insert, Delete, Update, soft delete e suas vantagens, TDD ([Test-Driven Development](https://www.google.com/search?q=Test-Driven+Development&oq=tdd&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIMCAEQABhDGIAEGIoFMgwIAhAjGCcYgAQYigUyDQgDEAAYkQIYgAQYigUyDAgEEAAYQxiABBiKBTIGCAUQRRg8MgYIBhBFGDwyBggHEEUYPNIBCDQwMDJqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwjz8pqGz4aTAxX2npUCHWDmKQ0QgK4QegYIAAgAEAM));

**Fluxo de trabalho de cada agente:**

- Agente Product Manager: 
Entender o objetivo geral do produto → entender a funcionalidade solicitada → Tirar as dúvidas que não foram especificadas na proposta de funcionalidade → consultar a documentação técnica do produto e das features que farão intercessão com a nova funcionalidade → Propor as regras de negócio necessárias para o encaixe da nova funcionalidade → Quebrar a solução em soluções menores → Construir o PRD de cada uma das soluções seguindo o template: (objetivo da solução; critérios de sucesso; Requisitos funcionais [seguindo o conceito de BDD]; Requisitos não-funcionais[segurança e tempo de carregamento]); Fluxograma da jornada do usuário utilizando o Mermaid) → Passar para o agente arquiteto de software.
- Agente Arquiteto de software:
    
    Entender as regras de negócio e toda a documentação presente no PRD → Tirar as dúvidas que são necessárias para sua tomada de decisão → Definição dos agentes necessários no desenvolvimento (backend, frontend e DBA - Database Administrator) → definição da arquitetura do software e da organização das pastas e arquivos → documentação técnica do que precisa ser desenvolvido por cada agente (backend, frontend e DBA - Database Administrator) e passagem da documentação para cada um deles.
    
- Agentes de backend, frontend e DBA - Database Administrator:
    
    Entender as documentações técnicas → tirar as dúvidas que o impede de tomar decisões → desenvolver os testes que serão utilizados (TDD ([Test-Driven Development](https://www.google.com/search?q=Test-Driven+Development&oq=tdd&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIMCAEQABhDGIAEGIoFMgwIAhAjGCcYgAQYigUyDQgDEAAYkQIYgAQYigUyDAgEEAAYQxiABBiKBTIGCAUQRRg8MgYIBhBFGDwyBggHEEUYPNIBCDQwMDJqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwjz8pqGz4aTAxX2npUCHWDmKQ0QgK4QegYIAAgAEAM))) → Puxar uma branch para trabalhar → Executar o código planejado → Fazer o commit para a branch definida → Chamar o arquiteto para fazer o code review.
    

**Premissas técnicas:**

- App mobile para android. Vou instalar o app no meu celular para usar com mais facilidade no meu dia a dia.
- A API deve ser desenvolvida de forma isolada para ser possível reaproveitarmos, posteriormente, em outros projetos, seja um app desktop, seja um app IOS, seja para permitir a criação de softwares whitelabels.
- 

**Premissas funcionais:**

Login: O app deve possuir uma tela de login e uma tela de cadastro para quem ainda não tem conta. Além disso, precisamos de um botão de recuperação de senha que enviará um email para o email de login redefinir a senha.

Onboarding: Precisamos saber o nome, o sexo, a data de nascimento, o peso atual, o % de gordura atual e a meta de peso, % de gordura e o tempo até atingir a meta.

Além disso, no onboarding, perguntaremos ao usuário as preferência alimentares (carne vermelha, peixe, ovos..) separando por macros: Proteína, carboidrato e gordura boa.

- [ ]  Aqui, o product manager precisa estudar os melhores alimentos para cada macro, dado o objetivo do usuário: Perder peso ou ganhar massa.

Também perguntaremos as preferência de esportes: Natação, corrida, musculação, tennis, futebol.. e outros esportes amados por brasileiros.

Processamento: Neste momento chamaremos nosso Agente de IA para compreender as preferências e objetivos e entregar um plano alimentar e de treino para o usuário, mostrando as calorias gastas em cada treino proposto e as calorias ingeridas em cada refeição.

Apresentação: Teremos três abas: Perfil (permitindo alterações em todas as configurações efetuadas), treino (apresentando o plano de treino) e alimentação (apresentando o plano alimentar da semana, começando pelo dia em que estivermos (se hoje é segunda-feira, apresentamos o plano de segunda-feira))