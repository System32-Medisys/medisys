# Validação para entrega do MVP

Antes de aprovar, use contas fictícias e um banco isolado. Registre o commit, navegador e resultado de cada cenário.

- Administrador: desbloquear conta bloqueada, confirmar contador zerado, redefinir senha, confirmar que a sessão antiga não funciona e conferir os eventos na auditoria. Sessões anteriores à implantação deste módulo exigem novo login.
- Atendente: cadastrar pessoa, agendar, cancelar com justificativa e reservar novamente o horário liberado. Reagendar e verificar que um conflito mantém o original. Registrar resultado e corrigir sem perder a versão anterior.
- Médico: conferir somente sua agenda e consultar resultados sem poder alterá-los.
- Paciente: consultar somente seus registros e confirmar que as ações administrativas são bloqueadas.
- Repetir os fluxos principais no celular e conferir filtros, mensagens, responsividade e tempo de carregamento.

O resultado admite link HTTPS protegido. Upload direto exige armazenamento privado e uma política de acesso. A edição dos horários da clínica não é critério explícito no documento de escopo, mas permanece prevista no RF20.
