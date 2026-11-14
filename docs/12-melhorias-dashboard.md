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
