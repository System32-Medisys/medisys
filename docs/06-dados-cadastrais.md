# Dados cadastrais

## Paciente

Campos obrigatórios:

- CPF;
- Nome completo;
- Data de nascimento;
- Telefone;
- E-mail;
- Sexo;
- Endereço;
- Senha.

Campo opcional:

- Convênio.

## Médico

Campos obrigatórios:

- CPF;
- Nome completo;
- Número do CRM;
- UF do CRM;
- Data de nascimento;
- Telefone;
- E-mail;
- Endereço;
- Especialidade;
- Senha.

Campo opcional:

- Dias de atendimento.

## Atendente e administrador

Campos obrigatórios:

- CPF;
- Nome completo;
- Data de nascimento;
- Telefone;
- Endereço;
- Senha.

## Endereço

- CEP;
- Logradouro;
- Número;
- Complemento, opcional;
- Bairro;
- Cidade;
- Estado.

## Tipo de exame

- Nome;
- Descrição;
- Status: ativo ou inativo.

## Validações

- CPF válido e único;
- Nome completo sem números;
- Data de nascimento válida e não futura;
- Telefone em formato válido;
- E-mail em formato válido;
- CRM obrigatório para médicos;
- Combinação CRM e UF única;
- Campos obrigatórios não podem conter somente espaços;
- Senha com no mínimo seis dígitos.

## Autenticação

O CPF será o login. A senha será armazenada somente em formato de hash e deverá ser alterada no primeiro acesso.
