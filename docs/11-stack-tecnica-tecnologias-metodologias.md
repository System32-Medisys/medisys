# Stack técnica, tecnologias e metodologias

## 1. Visão técnica

O Medisys é uma aplicação web full stack para organização de uma clínica, com autenticação, controle de acesso por perfil, cadastros, consultas, exames, resultados e auditoria.

A aplicação utiliza uma arquitetura centralizada: a interface e as APIs são mantidas no mesmo projeto Next.js, enquanto os dados são armazenados em um banco PostgreSQL hospedado no Supabase.

Fluxo simplificado:

1. O usuário acessa a interface pelo navegador;
2. O Next.js valida a sessão e o perfil;
3. As rotas da API validam os dados e as permissões;
4. Os serviços aplicam as regras de negócio;
5. O Prisma executa as operações no PostgreSQL;
6. O sistema registra operações importantes na auditoria;
7. A interface apresenta o resultado ao usuário.

## 2. Stack técnica

| Camada | Tecnologia | Utilização no Medisys |
|---|---|---|
| Interface | React | Construção dos formulários, tabelas e componentes interativos. |
| Framework | Next.js com App Router | Páginas, layouts, renderização no servidor e rotas da API. |
| Linguagem | TypeScript | Tipagem do código e redução de erros durante o desenvolvimento. |
| Estilos | CSS e CSS Modules | Identidade visual, responsividade e isolamento dos estilos dos módulos. |
| API | Route Handlers do Next.js | Operações de autenticação, usuários, consultas, exames, resultados e auditoria. |
| Validação | Zod | Validação e transformação dos dados recebidos pelas APIs. |
| Autenticação | JWT em cookie HTTP-only | Manutenção da sessão do usuário com proteção contra acesso direto pelo JavaScript do navegador. |
| Senhas | bcryptjs | Geração e verificação segura dos hashes das senhas. |
| Autorização | RBAC no servidor | Controle das operações permitidas para Paciente, Médico, Atendente e Administrador. |
| ORM | Prisma | Modelagem, consultas, transações, migrações e integração entre o código e o banco. |
| Banco de dados | PostgreSQL | Armazenamento relacional de usuários, agendamentos, resultados, históricos e auditoria. |
| Banco em nuvem | Supabase | Hospedagem e administração do PostgreSQL utilizado pelo sistema. |
| Testes | Vitest | Execução dos testes automatizados das regras e validações. |
| Versionamento | Git e GitHub | Controle de versões, branches, commits e pull requests. |
| Hospedagem | Vercel | Build e publicação da aplicação Next.js. |
| Ambiente | Node.js e npm | Execução do projeto e gerenciamento das dependências. |

## 3. Organização da arquitetura

O código está organizado em responsabilidades:

- `src/app`: páginas, layouts e rotas da aplicação;
- `src/app/api`: endpoints do backend;
- `src/components`: componentes reutilizáveis da interface;
- `src/lib`: autenticação, autorização, validações e utilitários;
- `src/services`: regras de negócio que não devem permanecer diretamente nas páginas ou APIs;
- `prisma`: schema, migrações e seed do banco;
- `docs`: requisitos, regras, decisões e registros do projeto.

A autorização é verificada no servidor. Esconder um botão na interface não substitui a validação da permissão na API.

## 4. Modelagem e persistência

O banco utiliza modelagem relacional porque as principais informações possuem vínculos definidos, como:

- usuário e endereço;
- médico e especialidades;
- paciente, médico e consulta;
- paciente, tipo e agendamento de exame;
- exame e versões do resultado;
- usuário e registros de auditoria.

O Prisma representa essas relações no código. Mudanças estruturais devem ser registradas em migrações, permitindo atualizar o Supabase sem recriar o banco completo.

Operações relacionadas são executadas em transações quando necessário. Isso reduz o risco de salvar apenas parte de uma operação, como criar um agendamento sem registrar sua auditoria.

## 5. Segurança e controle de acesso

O sistema utiliza quatro perfis fixos:

- Paciente;
- Médico;
- Atendente;
- Administrador.

As principais medidas adotadas são:

- autenticação por CPF e senha;
- senhas armazenadas como hash;
- sessão em cookie HTTP-only;
- troca obrigatória da senha inicial;
- bloqueio após cinco tentativas inválidas;
- verificação das permissões no servidor;
- validação de dados com Zod;
- desativação de registros em vez de exclusão definitiva;
- histórico e auditoria das operações importantes.

## 6. Metodologias e práticas adotadas

### 6.1 Desenvolvimento orientado ao MVP

O projeto utiliza a abordagem de Produto Mínimo Viável. Primeiro são implementados os fluxos essenciais para que a clínica consiga utilizar o sistema:

- autenticação;
- cadastros principais;
- consultas e exames;
- resultados;
- permissões;
- auditoria.

Funcionalidades adicionais são priorizadas depois da validação desses fluxos.

### 6.2 Desenvolvimento incremental

O sistema é desenvolvido em pequenas entregas. Cada módulo é implementado, testado e integrado progressivamente, reduzindo o risco de alterar toda a aplicação de uma única vez.

Essa prática é incremental, mas o grupo não definiu formalmente o uso de Scrum, Kanban ou sprints.

### 6.3 Branches por funcionalidade

Cada alteração relevante é desenvolvida em uma branch própria. A `main` representa a versão estável do sistema.

Antes da integração são verificados:

- conflitos com a `main`;
- TypeScript;
- testes automatizados;
- build de produção;
- impacto no Prisma e no Supabase.

A integração é realizada por pull request, respeitando as regras de proteção da `main`.

### 6.4 Commits pequenos e descritivos

O projeto adota commits separados e objetivos. Cada arquivo ou ponto de alteração recebe uma mensagem específica, facilitando:

- identificação das mudanças;
- revisão do código;
- localização de erros;
- recuperação de versões anteriores;
- registro do trabalho realizado.

### 6.5 Documentação contínua

A documentação é atualizada junto com a implementação. Requisitos, regras, decisões, progresso, tecnologias e próximos passos permanecem registrados na pasta `docs`.

### 6.6 Validação antes da integração

Antes de uma branch ser integrada, são executados:

- testes automatizados;
- validação do TypeScript;
- geração do Prisma Client;
- build de produção do Next.js;
- simulação ou verificação de conflitos;
- conferência das alterações no banco quando aplicável.

## 7. Resumo

A stack foi escolhida para manter o projeto centralizado, tipado e adequado a uma aplicação acadêmica com dados relacionais. O Next.js reúne interface e backend; o Prisma organiza o acesso ao banco; o PostgreSQL do Supabase mantém os dados; o GitHub controla as versões; e a Vercel publica a aplicação.

A metodologia adotada combina MVP, desenvolvimento incremental, branches por funcionalidade, commits pequenos, documentação contínua e validação técnica antes de cada integração.
