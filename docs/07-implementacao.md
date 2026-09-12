# Base de implementação

## Tecnologias
Next.js, React, TypeScript, CSS, PostgreSQL do Supabase, Prisma, Zod, bcrypt e JWT em cookie HTTP-only.

## Estrutura
- `src/app`: páginas e layout;
- `src/app/api`: rotas da API;
- `prisma`: modelo, migrações e seed;
- `docs`: documentação.

## Execução
1. Instale Node.js 20.9 ou superior;
2. Clone o repositório;
3. Copie `.env.example` para `.env`;
4. Preencha `DATABASE_URL`, `DIRECT_URL` e `SESSION_SECRET`;
5. Execute `npm install`;
6. Execute `npx prisma generate`;
7. Execute `npm run dev`;
8. Abra `http://localhost:3000`.

## Rotas principais
`/login`, `/trocar-senha`, `/dashboard`, `/api/health`, `/api/users`, `/api/consultations`, `/api/exams`, `/api/exams/[id]/results`, `/api/exam-types` e `/api/audit`.

## Banco
O sistema utiliza PostgreSQL do Supabase por meio do Prisma. O banco existente será atualizado por migração, sem recriação completa.

O seed já cria o primeiro administrador acadêmico, com troca obrigatória da senha inicial.

## Próximos passos
- Criar e validar a migração;
- Implementar pesquisas e mensagens;
- Completar desativação, reagendamento e cancelamento;
- Implementar arquivo opcional do resultado;
- Ampliar os testes.
