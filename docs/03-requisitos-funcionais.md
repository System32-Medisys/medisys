# Requisitos funcionais

## Autenticação e autorização

- **RF01:** permitir a autenticação dos usuários;
- **RF02:** identificar o perfil do usuário autenticado;
- **RF03:** autorizar cada funcionalidade conforme o perfil;
- **RF04:** permitir o encerramento seguro da sessão;
- **RF05:** permitir que o administrador redefina senhas.

## Paciente

- **RF06:** permitir que o paciente consulte somente seus próprios agendamentos;
- **RF07:** permitir que o paciente consulte somente seus próprios exames e resultados;
- **RF08:** impedir o acesso do paciente a dados de outros pacientes;
- **RF09:** impedir que o paciente crie, reagende ou cancele consultas e exames.

## Atendente

- **RF10:** permitir o cadastro, a atualização e a desativação de pacientes;
- **RF11:** permitir o cadastro, a atualização e a desativação de médicos;
- **RF12:** permitir o cadastro de tipos de exames;
- **RF13:** permitir o agendamento de consultas entre pacientes e médicos;
- **RF14:** permitir o agendamento de exames para pacientes;
- **RF15:** permitir a consulta dos agendamentos da clínica;
- **RF16:** permitir o reagendamento e o cancelamento de consultas e exames;
- **RF17:** permitir o registro de resultados de exames;
- **RF18:** permitir a correção de resultados preservando o histórico;
- **RF19:** impedir a exclusão definitiva de registros.

## Médico

- **RF20:** permitir que o médico consulte somente os agendamentos vinculados ao próprio cadastro;
- **RF21:** impedir que o médico consulte a agenda de outros médicos;
- **RF22:** permitir que o médico consulte exames e resultados de pacientes vinculados aos seus atendimentos;
- **RF23:** impedir que o médico acesse exames de pacientes sem vínculo de atendimento.

## Administrador

- **RF24:** permitir que o administrador execute as operações dos demais perfis;
- **RF25:** permitir o cadastro, a atualização e a desativação de atendentes;
- **RF26:** permitir o gerenciamento de especialidades e tipos de exames;
- **RF27:** permitir a consulta de todos os agendamentos e exames;
- **RF28:** permitir o gerenciamento dos perfis de acesso;
- **RF29:** permitir a redefinição de senhas.

## Auditoria

- **RF30:** registrar o usuário responsável por cadastros, alterações, cancelamentos e desativações;
- **RF31:** registrar data e horário das operações importantes;
- **RF32:** manter o histórico de agendamentos cancelados e registros desativados;
- **RF33:** manter o histórico de alterações dos resultados de exames.
