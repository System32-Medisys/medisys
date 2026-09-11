# Base de implementação

## Tecnologias iniciais

- Next.js com App Router;
- React;
- TypeScript;
- CSS;
- PostgreSQL hospedado no Supabase;
- Prisma ORM;
- Zod para validação;
- bcrypt para hash de senhas;
- JWT armazenado em cookie HTTP-only para sessão.

## Estrutura

- `src/app`: páginas e layout;
- `src/app/api`: rotas da API;
- `prisma`: schema, migration inicial e seed do banco de dados;
- `docs`: documentação do projeto.

## Como executar

1. Instale o Node.js 20.9 ou superior.
2. Clone o repositório.
3. Entre na pasta do projeto.
4. Execute `npm install`.
5. Execute `npm run dev`.
6. Abra `http://localhost:3000`.

## Rotas disponíveis

- `/login`: autenticação por CPF e senha;
- `/trocar-senha`: troca obrigatória da senha inicial;
- `/dashboard`: painel protegido por autenticação;
- `/api/health`: verificação da aplicação e do banco;
- `/api/users`: consulta e cadastro de usuários;
- `/api/consultations`: consulta e agendamento de consultas;
- `/api/exams`: consulta e agendamento de exames;
- `/api/exams/[id]/results`: inclusão e correção versionada de resultados;
- `/api/exam-types`: consulta e cadastro de tipos de exame;
- `/api/audit`: consulta dos registros de auditoria pelo administrador.

## Banco de dados

1. Crie um projeto no Supabase;
2. No painel do projeto, abra **Connect** e copie as URLs de conexão;
3. Copie `.env.example` para `.env`;
4. Preencha `DATABASE_URL` com o Transaction pooler do Supabase;
5. Preencha `DIRECT_URL` com a conexão direta ou o Session pooler;
6. Execute `npm run db:deploy` para aplicar as migrations existentes;
7. Execute `npm run db:seed` para criar os dados iniciais.

O Supabase é utilizado somente como banco PostgreSQL. A autenticação por CPF e senha, as sessões JWT e as permissões continuam sendo controladas pelo Medisys.

O seed cria um administrador acadêmico de demonstração. A senha deve ser trocada no primeiro acesso e os dados não devem ser utilizados em produção.

## Próximos passos

- Criar telas completas para os cadastros e agendamentos;
- Implementar atualização, desativação, reagendamento e cancelamento nas rotas;
- Configurar os horários de funcionamento da clínica;
- Ampliar os testes unitários e adicionar testes de integração;
- Migrar o banco para o SGBD escolhido para produção.
