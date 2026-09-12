# Requisitos funcionais

## Autenticação
- **RF01:** autenticar com CPF e senha;
- **RF02:** autorizar funcionalidades conforme um dos quatro perfis fixos;
- **RF03:** exigir troca da senha no primeiro acesso;
- **RF04:** bloquear após cinco tentativas incorretas;
- **RF05:** permitir somente ao administrador redefinir senhas e desbloquear contas;
- **RF06:** zerar as tentativas após desbloqueio e permitir encerrar a sessão.

## Paciente
- **RF07:** consultar somente os próprios agendamentos, exames e resultados;
- **RF08:** impedir que crie, reagende ou cancele agendamentos.

## Atendente
- **RF09:** cadastrar, atualizar e desativar pacientes e médicos;
- **RF10:** cadastrar e desativar tipos de exames;
- **RF11:** agendar, reagendar e cancelar consultas e exames com justificativa;
- **RF12:** consultar todos os agendamentos e exames;
- **RF13:** registrar e corrigir resultados preservando versões;
- **RF14:** impedir exclusão definitiva.

## Médico
- **RF15:** consultar somente a própria agenda;
- **RF16:** consultar exames e resultados de todos os pacientes;
- **RF17:** impedir alteração de resultados.

## Administrador
- **RF18:** executar operações dos demais perfis;
- **RF19:** cadastrar, atualizar e desativar atendentes;
- **RF20:** gerenciar especialidades, tipos de exames e horários da clínica;
- **RF21:** consultar todos os dados, históricos e auditoria;
- **RF22:** redefinir senhas e desbloquear contas.

## Agenda
- **RF23:** impedir datas passadas e conflitos do médico ou paciente;
- **RF24:** liberar horário cancelado ou reagendado;
- **RF25:** criar novo agendamento relacionado ao anterior no reagendamento;
- **RF26:** preservar datas, status, justificativa e responsável;
- **RF27:** validar as transições permitidas de status.

## Resultados
- **RF28:** registrar descrição, data, responsável e arquivo opcional;
- **RF29:** criar nova versão a cada correção;
- **RF30:** permitir acesso às versões para perfis autorizados.

## Pesquisas
- **RF31:** pesquisar pacientes por nome ou CPF;
- **RF32:** pesquisar médicos por nome, CRM ou especialidade;
- **RF33:** filtrar agendamentos por data, paciente, médico e status;
- **RF34:** filtrar exames por paciente, tipo, data e status.

## Mensagens
- **RF35:** informar acesso negado;
- **RF36:** informar campos inválidos;
- **RF37:** informar CPF ou CRM duplicado;
- **RF38:** informar conflito de horário;
- **RF39:** confirmar cadastro realizado.

## Auditoria
- **RF40:** registrar logins, falhas, bloqueios, desbloqueios e redefinições;
- **RF41:** registrar cadastros, alterações, desativações, agendamentos, status e resultados;
- **RF42:** filtrar auditoria por usuário, paciente, ação e período.
