# Usuários e permissões

## Paciente

Pode entrar com CPF e senha e consultar somente os próprios agendamentos, exames e resultados.

Não pode criar, reagendar ou cancelar agendamentos nem consultar informações de outros pacientes.

## Atendente

Pode:

- Cadastrar, atualizar e desativar pacientes e médicos;
- Cadastrar e desativar tipos de exames;
- Consultar todos os exames;
- Agendar, reagendar e cancelar consultas e exames;
- Consultar os agendamentos da clínica;
- Registrar e corrigir resultados, preservando o histórico.

Não pode excluir registros definitivamente, cadastrar atendentes, redefinir senhas ou desbloquear contas.

## Médico

Pode consultar somente a própria agenda e consultar exames e resultados de todos os pacientes.

Não pode criar, reagendar ou cancelar agendamentos, cadastrar usuários ou alterar resultados.

## Administrador

Pode:

- Executar as operações dos demais perfis;
- Cadastrar, atualizar e desativar atendentes;
- Gerenciar pacientes, médicos, especialidades e tipos de exames;
- Configurar os horários da clínica;
- Registrar e corrigir resultados;
- Redefinir senhas e desbloquear contas;
- Consultar todos os dados, históricos e registros de auditoria.

O MVP utiliza quatro perfis fixos: Paciente, Atendente, Médico e Administrador. Não haverá criação de permissões personalizadas.

## Regras de desativação

- Usuários inativos não podem entrar;
- Médicos e pacientes inativos não podem receber novos agendamentos;
- Tipos de exames inativos não podem ser selecionados;
- Registros anteriores permanecem no histórico;
- Nenhum perfil pode excluir registros definitivamente.
