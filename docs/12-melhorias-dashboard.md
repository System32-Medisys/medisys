# Melhorias funcionais do dashboard

## Objetivo
Manter o dashboard atual, corrigindo informações de data, próximo atendimento e pendências, sem alterar a stack, permissões ou o schema do banco.

## Mudanças
- Os indicadores diários utilizam o dia civil da clínica em `America/Porto_Velho` (UTC-04), inclusive próximo à meia-noite UTC.
- O destaque de próximo atendimento consulta o primeiro compromisso futuro de cada tipo (consulta ou exame) e escolhe o mais próximo; não destaca registros passados nem cancelados.
- O dashboard oferece um comando explícito para recarregar seus indicadores e mostra estado vazio quando não há próximos compromissos.
- As pendências apresentam totais reais, embora a lista mostre no máximo 20 itens de cada tipo; critérios: consultas agendadas/confirmadas com data futura e exames agendados/com resultado pendente.
- As informações continuam restritas pelas consultas de banco de acordo com o perfil autenticado; os atalhos mantêm os destinos autorizados.
- Os rótulos de indicadores foram refinados para diferenciar visão da equipe de acompanhamento pessoal.

## Arquivos
- `src/app/dashboard/page.tsx`
- `src/app/pendencias/page.tsx`
- `src/lib/dashboard.ts`
- `src/lib/dashboard.test.ts`

## Verificações necessárias antes de concluir
Executar `npm install`, `npx prisma generate`, `npm test`, `npx tsc --noEmit` e `npm run build`. Conferir manualmente dashboards de Paciente, Médico, Atendente e Administrador, telas com/sem atendimentos, data na virada do dia e indicadores coerentes com os registros. Validar layout desktop e celular e o preview na Vercel.

## Limitações
Não foi feita migração nem alteração de dados reais. As alterações remotas não foram executadas localmente nesta etapa; a conclusão depende dos testes de integração e de build. A atualização dos indicadores é manual, não em tempo real.


## Evolução adicional — filtros, status, alertas e gráficos

- **Período:** a página `/dashboard?periodo=hoje|semana|mes` mostra indicadores e gráficos para o dia, semana civil (segunda a domingo) ou mês civil, sempre em `America/Porto_Velho`. Valor inválido assume "hoje".
- **Indicadores de status:** consultas e exames são agrupados pelo status atual, dentro do período da **data agendada**. Não representam necessariamente atendimentos realizados naquele dia: por exemplo, uma consulta reagendada mantém sua data original como referência.
- **Alertas:** consultas agendadas ou confirmadas nas próximas 24 horas e exames com resultado pendente. Alertas são contagens, não notificações em tempo real.
- **Gráficos:** barras diárias de quantidade de consultas e exames agendados no período, sem revelar nomes ou documentos; dias vazios são exibidos com valor zero.
- **Acesso:** todas as consultas de banco utilizam os filtros de perfil já existentes. Pacientes consultam somente registros próprios; médicos somente a própria agenda de consultas, mantendo o acesso a exames conforme a regra vigente; equipe administrativa possui visão global.
- **Escopo:** não foram adicionadas tabelas, migrações ou bibliotecas.

## Validação da evolução
- Testes unitários ampliados em `src/lib/dashboard.test.ts` para dia, semana, mês, virada de dia e série diária.
- Necessário executar `npm install`, `npx prisma generate`, `npm test`, `npx tsc --noEmit`, `npm run build` em um ambiente com dependências e configuração disponíveis.
- Verificar manualmente perfis, dados com e sem registros, navegação no celular, preview na Vercel e consistência com a página de pendências.
- Não foi executada validação de integração com banco real nesta etapa. Não fazer merge antes dessas verificações.
