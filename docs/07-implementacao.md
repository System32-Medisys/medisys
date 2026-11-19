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
Páginas: `/login`, `/trocar-senha`, `/dashboard`, `/dashboard/exportar`, `/busca`, `/pendencias`, `/cadastro`, `/cadastro/atendente`, `/cadastro/editar/[id]`, `/consultas`, `/consultas/nova`, `/exames`, `/exames/novo`, `/exames/[id]/resultados`, `/pacientes`, `/medicos`, `/atendentes`, `/tipos-exames`, `/auditoria` e `/configuracoes`.

APIs: `/api/health`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/change-password`, `/api/users`, `/api/users/[id]`, `/api/users/[id]/access`, `/api/consultations`, `/api/consultations/[id]`, `/api/exams`, `/api/exams/[id]`, `/api/exams/[id]/results`, `/api/exam-types`, `/api/exam-types/[id]`, `/api/specialties`, `/api/specialties/[id]` e `/api/audit`.

## Navegação
- O menu autenticado mostra apenas os módulos permitidos para o perfil conectado;
- Pacientes acessam as próprias consultas, exames e resultados;
- Médicos acessam a própria agenda e os exames e resultados;
- Atendentes acessam consultas, exames, pacientes, médicos, cadastro de pessoas e tipos de exames;
- Administradores também acessam atendentes, cadastro de atendentes, auditoria e configurações;
- As permissões continuam sendo verificadas no servidor, independentemente da visibilidade dos botões.

## Banco
O sistema utiliza PostgreSQL do Supabase por meio do Prisma. O banco existente será atualizado por migração, sem recriação completa.

A estrutura das tabelas e seus relacionamentos está documentada em [Modelagem do banco de dados](16-modelagem-banco.md).

O seed já cria o primeiro administrador acadêmico, com troca obrigatória da senha inicial.

## Estado atual
- Busca geral implementada com controle por perfil;
- Mensagens de validação, sucesso e acesso negado implementadas;
- Atualização e desativação de usuários implementadas;
- Cancelamento, reagendamento, faltas e históricos implementados;
- Resultados versionados com link HTTPS opcional implementados;
- Redefinição de senha e desbloqueio exclusivos do administrador implementados;
- Auditoria disponível para o administrador.

As pendências atuais são testes manuais integrados, validação do ambiente de entrega e correção dos avisos CSS não bloqueantes do dashboard.
