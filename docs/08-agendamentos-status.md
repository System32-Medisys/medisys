# Agendamentos e status

## Consulta
Status: **AGENDADA**, **CONFIRMADA**, **REALIZADA**, **CANCELADA**, **REAGENDADA**, **FALTA_PACIENTE** e **FALTA_MEDICO**.

Transições:
- AGENDADA → CONFIRMADA, CANCELADA, REAGENDADA, FALTA_PACIENTE ou FALTA_MEDICO;
- CONFIRMADA → REALIZADA, CANCELADA, REAGENDADA, FALTA_PACIENTE ou FALTA_MEDICO.

## Exame
Status: **AGENDADO**, **REALIZADO**, **RESULTADO_PENDENTE**, **RESULTADO_DISPONIVEL**, **CANCELADO**, **REAGENDADO** e **FALTA_PACIENTE**.

Transições:
- AGENDADO → REALIZADO, CANCELADO, REAGENDADO ou FALTA_PACIENTE;
- REALIZADO → RESULTADO_PENDENTE;
- RESULTADO_PENDENTE → RESULTADO_DISPONIVEL.

## Reagendamento
- Registro anterior recebe status de reagendamento;
- Novo agendamento é criado e relacionado ao anterior;
- Datas, justificativa, responsável e horário da alteração são preservados;
- Horário anterior volta a ficar disponível.

## Regras
- Somente atendentes e administradores podem alterar;
- Cancelamento e reagendamento exigem justificativa;
- Não há prazo mínimo;
- Datas passadas e conflitos são impedidos;
- Estados finais não voltam a estados anteriores;
- Registros concluídos permanecem no histórico.

## Operação na interface

Atendentes e administradores usam **Alterar agendamento** nas listagens de Consultas e Exames. O servidor valida cada transição, exige justificativa para cancelamento ou reagendamento e impede registrar falta antes do horário. Falta médica se aplica somente a consultas.

O reagendamento mantém paciente e médico ou tipo de exame, exige um horário futuro diferente do original e revalida disponibilidade e cadastros ativos. A mudança de status, o novo registro vinculado, o histórico e a auditoria são gravados na mesma transação: se houver conflito, o agendamento original permanece inalterado. Cancelamentos e reagendamentos liberam o horário original sem excluir registros.

O status de resultado disponível é atribuído pela gravação do resultado, não pelo seletor de status.
