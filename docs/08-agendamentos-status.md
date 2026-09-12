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
