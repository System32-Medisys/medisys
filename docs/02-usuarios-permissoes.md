# Usuários e permissões

## Paciente

Pode:

- Entrar utilizando CPF e senha;
- Consultar somente os próprios agendamentos;
- Consultar somente os próprios exames e resultados.

Não pode:

- Criar, reagendar ou cancelar agendamentos;
- Consultar informações de outros pacientes.

## Atendente

Pode:

- Cadastrar, atualizar e desativar pacientes;
- Cadastrar, atualizar e desativar médicos;
- Cadastrar e desativar tipos de exames;
- Consultar todos os exames de pacientes;
- Agendar, reagendar e cancelar consultas;
- Agendar, reagendar e cancelar exames;
- Consultar os agendamentos da clínica;
- Registrar e corrigir resultados, preservando o histórico.

Não pode:

- Excluir registros definitivamente;
- Cadastrar atendentes;
- Redefinir senhas.

## Médico

Pode:

- Consultar somente os agendamentos nos quais seja o médico vinculado;
- Consultar exames e resultados de todos os pacientes.

Não pode:

- Consultar a agenda de outros médicos;
- Criar, reagendar ou cancelar agendamentos;
- Cadastrar usuários;
- Registrar ou alterar resultados.

## Administrador

Pode:

- Executar todas as operações dos demais perfis;
- Cadastrar, atualizar e desativar atendentes;
- Gerenciar pacientes, médicos, especialidades e tipos de exames;
- Configurar os horários de funcionamento da clínica;
- Registrar e corrigir resultados;
- Redefinir senhas;
- Gerenciar perfis e permissões;
- Consultar todos os pacientes, médicos e atendentes;
- Consultar todos os agendamentos, exames, históricos e dados relacionados;
- Consultar os registros de auditoria.

Não pode excluir registros definitivamente.

## Matriz resumida

| Funcionalidade | Paciente | Atendente | Médico | Administrador |
|---|:---:|:---:|:---:|:---:|
| Consultar os próprios agendamentos | Sim | — | Sim | Sim |
| Consultar os próprios exames | Sim | — | — | Sim |
| Consultar agenda da clínica | Não | Sim | Não | Sim |
| Consultar todos os exames | Não | Sim | Sim | Sim |
| Cadastrar pacientes e médicos | Não | Sim | Não | Sim |
| Agendar, reagendar e cancelar | Não | Sim | Não | Sim |
| Registrar resultados | Não | Sim | Não | Sim |
| Cadastrar atendentes | Não | Não | Não | Sim |
| Redefinir senhas | Não | Não | Não | Sim |
| Consultar auditoria | Não | Não | Não | Sim |
