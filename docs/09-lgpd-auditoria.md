# LGPD e auditoria

## LGPD simplificada

Por se tratar de um projeto acadêmico, o Medisys adotará controles fundamentais:

- Acesso por CPF e senha;
- Senhas armazenadas com hash;
- Permissões separadas por perfil;
- Pacientes não poderão consultar dados de outros pacientes;
- Usuários inativos ou bloqueados não poderão acessar o sistema;
- Resultados ficarão disponíveis somente aos perfis autorizados;
- Dados reais não deverão ser utilizados no desenvolvimento e nos testes;
- Mensagens de erro não deverão exibir dados pessoais;
- A comunicação deverá utilizar HTTPS quando o sistema for publicado;
- O banco deverá possuir cópias de segurança quando estiver em produção.

## Eventos auditados

- Login realizado;
- Tentativa incorreta de login;
- Bloqueio e desbloqueio;
- Troca e redefinição de senha;
- Cadastro, atualização e desativação de usuários;
- Criação, cancelamento e reagendamento;
- Mudança de status;
- Registro e correção de resultados;
- Visualização de resultados;
- Mudança de perfil e permissão.

## Dados do registro

Cada evento deverá conter:

- Identificador;
- Usuário responsável;
- Perfil;
- Ação realizada;
- Tipo e identificador do registro afetado;
- Data e horário;
- Resultado: sucesso ou falha;
- Justificativa, quando necessária;
- Valor anterior e novo valor em alterações.

## Proteção da auditoria

- Somente administradores poderão consultar os registros;
- Os registros não poderão ser alterados ou excluídos pela interface;
- Senhas e tokens nunca serão armazenados;
- O conteúdo completo de um resultado médico não será duplicado no log;
- A consulta poderá ser filtrada por usuário, paciente, ação e período;
- Os registros deverão possuir backup.
