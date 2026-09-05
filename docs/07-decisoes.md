# Decisões do projeto

## Perfis definidos

O sistema possui quatro perfis:

- Paciente;
- Atendente;
- Médico;
- Administrador.

## Decisões confirmadas

- O paciente apenas consulta seus próprios agendamentos e exames;
- O atendente realiza os agendamentos de consultas e exames;
- O médico consulta somente a própria agenda;
- O médico pode consultar exames de pacientes vinculados aos seus atendimentos;
- O atendente registra e corrige resultados de exames;
- Resultados corrigidos mantêm histórico;
- Registros não são excluídos definitivamente, somente desativados;
- O administrador possui todas as permissões e pode cadastrar atendentes;
- O administrador pode redefinir senhas;
- CPF, nome completo, data de nascimento e endereço são obrigatórios para pacientes;
- CPF, nome completo, CRM, UF do CRM, data de nascimento e endereço são obrigatórios para médicos.

## Pendências

- Definir os campos obrigatórios dos atendentes e administradores;
- Definir os dados obrigatórios de cada tipo de exame;
- Definir políticas de recuperação de senha;
- Definir prazos permitidos para cancelamento e reagendamento;
- Definir por quanto tempo os registros de auditoria serão mantidos.
