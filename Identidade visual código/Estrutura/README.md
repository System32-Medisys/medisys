# Medisys — protótipo de identidade visual

Esta pasta é uma interface demonstrativa em React/Vite. Não é a aplicação Next.js oficial do grupo e não implementa autenticação, banco, permissões ou agendamentos reais.

## Executar
Na pasta que contém package.json, execute `npm.cmd install` e `npm.cmd run dev` no PowerShell. Para compilar: `npm.cmd run build`.

## Ajustes
- Nome Medisys e identidade SYSTEM32.
- Apresentação de uma clínica, sem catálogo de hospitais ou avaliações fictícias.
- Agendamento público e opções de pagamento removidos da página.
- Perfis descritos conforme docs/02-usuarios-permissoes.md: paciente consulta os próprios dados; atendente e administrador agendam; médico consulta sua agenda e exames/resultados.
- Quem somos, Como funciona, Perfis e Atendimento com navegação interna.
- Sem botões de login fictícios, contatos inventados ou promessas de mensagens enviadas.

## Integração
O conteúdo desta pasta deve substituir somente a pasta `Identidade visual código/Estrutura` da sua branch. Não substituir arquivos da raiz do Medisys, configurações Next.js, APIs ou banco. A adaptação ao sistema oficial será uma tarefa separada.

O logo SYSTEM32 é uma adaptação vetorial simplificada da referência. O protótipo original continua no histórico da branch; sua lógica de agendamento demonstrativa não é carregada por esta página.
