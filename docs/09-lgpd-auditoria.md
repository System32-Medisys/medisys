# Controles básicos e auditoria

## Controles básicos
- Acesso por CPF e senha;
- Senhas armazenadas com hash;
- Permissões por perfil;
- Usuários inativos ou bloqueados sem acesso;
- Dados reais não utilizados nos testes;
- Mensagens sem exposição de dados;
- HTTPS quando publicado.

## Eventos auditados
- Login e tentativa incorreta;
- Bloqueio e desbloqueio;
- Troca e redefinição de senha;
- Cadastro, atualização e desativação;
- Criação, cancelamento e reagendamento;
- Mudança de status;
- Registro e correção de resultados;
- Visualização de resultados;
- Mudança de perfil.

## Dados do registro
Identificador, usuário, perfil, ação, registro afetado, data, horário, resultado, justificativa e valores anterior e novo quando houver alteração.

## Proteção
- Somente administradores consultam;
- Registros não podem ser alterados ou excluídos pela interface;
- Senhas e tokens não são registrados;
- Resultados completos não são duplicados no log;
- Filtros por usuário, paciente, ação e período.
