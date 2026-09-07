# Agendamentos e status

## Consulta médica

Campos:

- Data;
- Hora;
- Paciente;
- Médico;
- Status;
- Atendente responsável;
- Justificativa para cancelamento ou reagendamento.

Status:

- **AGENDADA**
- **CONFIRMADA**
- **REALIZADA**
- **CANCELADA**
- **REAGENDADA**
- **FALTA_PACIENTE**
- **FALTA_MEDICO**

## Exame

Campos:

- Data;
- Hora;
- Paciente;
- Tipo de exame;
- Status;
- Atendente responsável;
- Justificativa para cancelamento ou reagendamento.

Status:

- **AGENDADO**
- **REALIZADO**
- **RESULTADO_PENDENTE**
- **RESULTADO_DISPONIVEL**
- **CANCELADO**
- **FALTA_PACIENTE**

## Regras

- Somente atendentes e administradores poderão agendar, reagendar ou cancelar;
- Cancelamentos e reagendamentos exigirão justificativa;
- Não haverá prazo mínimo para cancelamento;
- Horários cancelados ficarão disponíveis novamente;
- O sistema impedirá agendamentos em datas passadas;
- O sistema impedirá conflitos de horário do paciente e do médico;
- Agendamentos realizados permanecerão no histórico;
- O reagendamento preservará a data e o horário anteriores;
- Uma consulta realizada não poderá voltar para agendada.
