# Decisões do projeto

## Perfis

- Paciente;
- Atendente;
- Médico;
- Administrador.

## Decisões confirmadas

- O CPF será utilizado como login;
- A primeira senha será escolhida pelo cadastrante;
- A senha terá no mínimo seis dígitos;
- A conta será bloqueada após cinco tentativas incorretas;
- O administrador redefinirá senhas manualmente;
- A troca da senha será obrigatória no primeiro acesso;
- O paciente apenas consultará os próprios agendamentos, exames e resultados;
- Atendentes realizarão os agendamentos, reagendamentos e cancelamentos;
- Cancelamentos e reagendamentos exigirão justificativa;
- Não haverá prazo mínimo para cancelamento;
- Horários cancelados voltarão a ficar disponíveis;
- Faltas serão registradas como falta do paciente ou falta do médico;
- Atendentes consultarão todos os exames e registrarão resultados;
- Todos os médicos poderão consultar exames e resultados de todos os pacientes;
- Médicos consultarão somente a própria agenda;
- Registros serão desativados, nunca excluídos;
- O administrador poderá consultar todos os dados e históricos;
- O administrador configurará os horários de funcionamento da clínica;
- Agendamentos em datas passadas serão impedidos;
- O sistema manterá controles básicos de LGPD por ser um projeto acadêmico;
- A auditoria seguirá as regras descritas em [LGPD e auditoria](09-lgpd-auditoria.md).

## Pendências futuras

- Definir o formato completo do resultado do exame;
- Criar casos de uso e fluxos;
- Criar o modelo do banco de dados;
- Criar protótipos;
- Criar casos de teste.
