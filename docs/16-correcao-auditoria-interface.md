# Correções da auditoria de interface — 19/11/2026

## Problema e correção

Na aplicação publicada, Consultas e Nova consulta ocupavam 1.200 px em uma tela de 390 px. O menu horizontal contribuía com sua largura intrínseca para a coluna do layout móvel. A coluna agora usa `minmax(0, 1fr)`, e o menu permanece limitado à largura da barra lateral, com rolagem própria. A barra lateral também serve de referência para posicionar “Sair”. Os campos de filtros e agendamento têm largura limitada ao espaço disponível.

O login agora trata falhas de rede, respostas inválidas e tempo de espera de 20 segundos, exibindo mensagem e liberando o botão para nova tentativa. Foi adicionado um estado de carregamento para transições de rota, que antes podiam parecer sem resposta. Isso não comprova nem corrige uma eventual lentidão do banco ou da hospedagem.

## Validação local

- Base: `664ac0419387f77a9ecf0bbeddd1b1fef6ad6928`.
- Google Chrome; prévia temporária com AppShell, ListFilters e ScheduleForm reais e dados inteiramente fictícios, sem conexão ao banco. A rota temporária foi removida antes da compilação final.
- Em tela de 390 px, a listagem e o formulário apresentaram largura de página de 375 px, com o restante reservado à barra de rolagem vertical; sem excedente horizontal global. O formulário também foi conferido em 320, 768 e 1.440 px, sem exceder a tela.
- O link da listagem para o formulário da prévia navegou normalmente. Isso não encerra a investigação da navegação autenticada publicada.
- `npm test`: 26 testes aprovados em 5 arquivos.
- `npm run build`: aprovado, incluindo verificação de tipos; avisos preexistentes no CSS do dashboard sobre `end`/`flex-end`.
- Nenhum registro real foi alterado. Não foram executadas migrações, seeds ou operações no banco publicado.

## Validações ainda necessárias

Após implantação, repetir Consultas e Nova consulta em tela estreita e a navegação autenticada. Confirmar a versão implantada pelo commit do deploy. Os testes de contas bloqueadas, invalidação de sessões, conflitos de agenda, histórico de resultados e isolamento dos quatro perfis continuam dependendo do ambiente isolado e das contas fictícias definidos em `15-validacao-entrega-mvp.md`.

A ausência de horários configurados é uma pendência operacional; não foram inventados horários nem alterada a configuração da clínica. RF20 deve ser tratado com os horários definidos pela equipe.
