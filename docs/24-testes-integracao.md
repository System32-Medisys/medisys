# Testes de integração

## Resultado registrado em 20/11/2026

Base testada: `b1e0ba6` (main após integração do PR #25).
15 cenários aprovados usando aplicação Next.js local, requisições HTTP reais,
cookies assinados, Prisma, migrations e PostgreSQL local. Sem mocks de banco,
autenticação ou serviços. Apenas contas e dados fictícios em banco isolado.

1. Login com os quatro perfis e renderização do dashboard.
2. Autenticação obrigatória e permissões administrativas.
3. Cadastro, primeiro acesso, troca de senha e invalidação da sessão anterior.
4. Remoção de campos opcionais e persistência da data de nascimento.
5. Catálogo, agendamento e auditoria.
6. Rejeição de conflito de médico/paciente e de data passada.
7. Isolamento das consultas por paciente e médico.
8. Reagendamento conflitante reverte status, histórico e auditoria.
9. Reagendamento válido preserva vínculo e libera horário anterior.
10. Cancelamento exige justificativa e libera reserva.
11. Exame e resultados mantêm versões anteriores após correção.
12. Leitura de resultados autorizada, escrita restrita e isolamento do paciente.
13. Cinco falhas simultâneas bloqueiam a conta com contador e auditoria corretos.
14. Administrador desbloqueia e redefine senha, invalidando sessão anterior.
15. Logout remove cookie e redireciona para login usando HTTP 303.

## Como executar

Requisitos: Node.js, dependências instaladas e PostgreSQL local com um banco
dedicado chamado `medisys_integration`. Não utilize dados reais.

No PowerShell, dentro da raiz do projeto:

```powershell
npm.cmd ci
npx.cmd prisma generate
$env:INTEGRATION_DATABASE_URL = 'postgresql://USUARIO:SENHA@127.0.0.1:5432/medisys_integration'
npm.cmd run test:integration
```

O script recusa hosts externos e outros nomes de banco. A cada execução cria
um schema aleatório, aplica as migrations e inicia seu próprio servidor em
127.0.0.1:4197. A porta pode ser alterada com `INTEGRATION_PORT`.
Não usa a conexão de produção do `.env`. Os schemas são preservados para
inspeção; use um banco descartável para evitar acúmulo após várias execuções.
O servidor da aplicação é encerrado ao terminar.

Resultados: `integration-results/report.json` e `integration-results/server.log`,
ignorados pelo Git. No GitHub Actions, ficam disponíveis como artefato por sete dias.
O workflow `integration.yml` executa a mesma suíte com PostgreSQL 17 em serviço
isolado nas pull requests para main e também permite execução manual.

## Limites da validação

São testes de integração via HTTP e banco. Não equivalem a uma revisão visual
ou navegação interativa em navegador. Responsividade no celular, cliques dos
formulários e o ambiente de produção continuam com validação manual pendente.
O fluxo de resultados usa transições de status permitidas pela API; não simula
a passagem real do tempo nem uma realização clínica.
