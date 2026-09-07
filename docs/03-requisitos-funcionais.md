# Requisitos funcionais

## Autenticação

- **RF01:** permitir autenticação utilizando CPF e senha;
- **RF02:** identificar o perfil do usuário autenticado;
- **RF03:** autorizar cada funcionalidade conforme o perfil;
- **RF04:** exigir troca da senha no primeiro acesso;
- **RF05:** bloquear a conta após cinco tentativas incorretas;
- **RF06:** permitir que o administrador redefina senhas manualmente;
- **RF07:** permitir o encerramento seguro da sessão.

## Paciente

- **RF08:** permitir a consulta somente dos próprios agendamentos;
- **RF09:** permitir a consulta somente dos próprios exames e resultados;
- **RF10:** impedir o acesso a informações de outros pacientes;
- **RF11:** impedir que o paciente crie, reagende ou cancele agendamentos.

## Atendente

- **RF12:** permitir cadastrar, atualizar e desativar pacientes;
- **RF13:** permitir cadastrar, atualizar e desativar médicos;
- **RF14:** permitir cadastrar e desativar tipos de exames;
- **RF15:** permitir consultar todos os exames de pacientes;
- **RF16:** permitir agendar consultas entre pacientes e médicos;
- **RF17:** permitir agendar exames para pacientes;
- **RF18:** permitir consultar os agendamentos da clínica;
- **RF19:** permitir reagendar e cancelar consultas e exames mediante justificativa;
- **RF20:** permitir registrar resultados de exames;
- **RF21:** permitir corrigir resultados preservando o histórico;
- **RF22:** impedir a exclusão definitiva de registros.

## Médico

- **RF23:** permitir consultar somente os agendamentos vinculados ao próprio cadastro;
- **RF24:** impedir a consulta da agenda de outros médicos;
- **RF25:** permitir consultar exames e resultados de todos os pacientes;
- **RF26:** impedir o registro ou a alteração de resultados pelo médico.

## Administrador

- **RF27:** permitir executar as operações dos demais perfis;
- **RF28:** permitir cadastrar, atualizar e desativar atendentes;
- **RF29:** permitir gerenciar especialidades e tipos de exames;
- **RF30:** permitir configurar os horários de funcionamento da clínica;
- **RF31:** permitir consultar todos os usuários, agendamentos, exames e históricos;
- **RF32:** permitir gerenciar perfis e permissões;
- **RF33:** permitir consultar os registros de auditoria.

## Agenda e histórico

- **RF34:** impedir agendamentos em datas passadas;
- **RF35:** impedir conflitos de horário do médico;
- **RF36:** impedir conflitos de horário do paciente;
- **RF37:** tornar disponível o horário de um agendamento cancelado;
- **RF38:** manter o histórico de cancelamentos, reagendamentos e faltas;
- **RF39:** registrar a justificativa de cancelamentos e reagendamentos.

## Auditoria

- **RF40:** registrar logins, falhas de login, bloqueios e desbloqueios;
- **RF41:** registrar cadastros, alterações e desativações;
- **RF42:** registrar agendamentos, cancelamentos, reagendamentos e mudanças de status;
- **RF43:** registrar inclusão, correção e visualização de resultados;
- **RF44:** registrar alterações de perfil, permissões e senhas;
- **RF45:** permitir que o administrador filtre a auditoria por usuário, paciente, ação e período.
