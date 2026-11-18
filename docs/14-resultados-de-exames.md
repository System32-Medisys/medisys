# Resultados de exames

Na lista **Exames**, atendentes e administradores podem registrar um resultado quando o exame estiver com resultado pendente. A descrição e a data são informadas no formulário; o responsável é identificado pela sessão. O campo opcional de arquivo aceita um link HTTPS já protegido pelo serviço de armazenamento. Não há upload direto nem configuração de permissões do armazenamento por este módulo.

Corrigir um resultado cria uma nova versão, sem sobrescrever as anteriores. A página mostra descrição, data, responsável e link opcional de cada versão. Pacientes só veem seus próprios exames; médicos e equipe mantêm o acesso já documentado. A visualização e a gravação geram auditoria sem registrar o conteúdo clínico.
