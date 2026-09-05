# Usuários e permissões

## Paciente

- Consultar somente os próprios agendamentos;
- Consultar somente os próprios exames e resultados;
- Não criar, reagendar ou cancelar agendamentos;
- Não acessar informações de outros pacientes.

## Atendente

- Cadastrar, atualizar e desativar pacientes;
- Cadastrar, atualizar e desativar médicos;
- Cadastrar tipos de exames;
- Agendar, reagendar e cancelar consultas entre pacientes e médicos;
- Agendar, reagendar e cancelar exames;
- Consultar os agendamentos da clínica;
- Registrar e corrigir resultados de exames, preservando o histórico;
- Não excluir registros definitivamente;
- Não cadastrar atendentes.

## Médico

- Consultar somente os agendamentos nos quais seja o médico vinculado;
- Consultar exames e resultados dos pacientes vinculados aos seus atendimentos;
- Não consultar a agenda de outros médicos;
- Não acessar exames de pacientes sem vínculo de atendimento;
- Não cadastrar usuários ou realizar agendamentos.

## Administrador

- Possuir todas as permissões operacionais dos demais perfis;
- Consultar todos os agendamentos e exames;
- Cadastrar, atualizar e desativar atendentes;
- Gerenciar pacientes, médicos, especialidades e tipos de exames;
- Registrar e corrigir resultados de exames;
- Redefinir senhas;
- Gerenciar perfis e permissões;
- Não excluir registros definitivamente.

## Matriz resumida

| Funcionalidade | Paciente | Atendente | Médico | Administrador |
|---|:---:|:---:|:---:|:---:|
| Consultar os próprios agendamentos | Sim | — | Sim | Sim |
| Consultar os próprios exames | Sim | — | — | Sim |
| Consultar agenda da clínica | Não | Sim | Não | Sim |
| Consultar exames dos pacientes atendidos | Não | Não | Sim | Sim |
| Cadastrar pacientes e médicos | Não | Sim | Não | Sim |
| Agendar consultas e exames | Não | Sim | Não | Sim |
| Registrar resultados de exames | Não | Sim | Não | Sim |
| Cadastrar atendentes | Não | Não | Não | Sim |
| Redefinir senhas | Não | Não | Não | Sim |
