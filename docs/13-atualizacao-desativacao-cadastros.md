# Atualização e desativação de cadastros

## Objetivo

Permitir a manutenção dos cadastros sem excluir registros ou comprometer históricos existentes.

## Funcionalidades

- edição de pacientes e médicos por Atendente ou Administrador;
- edição de atendentes somente por Administrador;
- desativação de usuários (sem reativação ou desbloqueio neste módulo);
- cadastro, edição, desativação e reativação de tipos de exames;
- cadastro, edição, desativação e reativação de especialidades pelo Administrador;
- auditoria de todas as alterações de cadastro e status.

## Regras aplicadas

- administradores não podem ser alterados por este módulo;
- atendentes não podem editar ou desativar outros atendentes;
- registros não são excluídos;
- usuários inativos não conseguem autenticar e não aparecem em novos agendamentos;
- médicos e pacientes inativos não podem receber novos agendamentos;
- tipos de exames inativos não podem ser selecionados;
- especialidades inativas não podem ser adicionadas a médicos; vínculos já existentes podem ser mantidos;
- consultas, exames, resultados e históricos anteriores permanecem preservados;
- CPF, e-mail e CRM continuam sujeitos às restrições de unicidade.

## Arquivos principais

- `src/app/api/users/[id]/route.ts`;
- `src/app/api/exam-types/[id]/route.ts`;
- `src/app/api/specialties`;
- `src/app/cadastro/editar/[id]/page.tsx`;
- `src/components/edit-user-form.tsx`;
- `src/components/registration-actions.tsx`;
- `src/components/catalog-manager.tsx`.

## Validação necessária

Antes do merge, executar testes, TypeScript e build, além de validar os fluxos com Atendente e Administrador.
