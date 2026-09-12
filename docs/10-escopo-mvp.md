# Escopo do MVP

O MVP será considerado concluído quando os fluxos abaixo estiverem funcionando.

## Acesso
- Login dos quatro perfis;
- Troca da senha inicial;
- Bloqueio após cinco tentativas;
- Redefinição e desbloqueio pelo administrador;
- Mensagem de acesso negado.

## Cadastros
- Cadastrar, atualizar, pesquisar e desativar pacientes e médicos;
- Cadastrar, atualizar e desativar atendentes;
- Cadastrar e desativar especialidades e tipos de exames;
- Impedir CPF e CRM duplicados;
- Impedir uso de registros inativos.

## Agendamentos
- Agendar consultas e exames;
- Reagendar criando novo registro relacionado ao anterior;
- Cancelar com justificativa;
- Registrar faltas;
- Impedir datas passadas e conflitos;
- Validar transições de status;
- Pesquisar e filtrar agendamentos.

## Resultados
- Registrar descrição, data, responsável e arquivo opcional;
- Corrigir criando nova versão;
- Consultar conforme as permissões;
- Pesquisar e filtrar exames.

## Mensagens
- Acesso negado;
- Campos inválidos;
- CPF ou CRM duplicado;
- Conflito de horário;
- Cadastro realizado.

## Histórico e auditoria
- Preservar registros desativados, cancelados e reagendados;
- Registrar operações importantes;
- Permitir consulta da auditoria pelo administrador.

## Validação
Antes da entrega, o grupo deverá testar ao menos um fluxo completo de cada perfil e confirmar que operações não autorizadas são impedidas.
