# Base de implementação

## Tecnologias iniciais

- Next.js com App Router;
- React;
- TypeScript;
- CSS;
- SQL com modelo compatível com SQLite para desenvolvimento inicial.

## Estrutura

- `src/app`: páginas e layout;
- `src/app/api`: rotas da API;
- `database`: scripts do banco de dados;
- `docs`: documentação do projeto.

## Como executar

1. Instale o Node.js 20.9 ou superior.
2. Clone o repositório.
3. Entre na pasta do projeto.
4. Execute `npm install`.
5. Execute `npm run dev`.
6. Abra `http://localhost:3000`.

## Rotas disponíveis

- `/`: página inicial;
- `/agendamentos`: tela demonstrativa da agenda;
- `/api/health`: verificação da API.

## Próximos passos

- Conectar as telas ao banco;
- Implementar cadastros;
- Criar autenticação e perfis de acesso;
- Implementar criação e cancelamento de consultas;
- Substituir dados demonstrativos por dados reais;
- Adicionar testes.
