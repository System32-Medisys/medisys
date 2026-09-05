# Dados cadastrais

## Paciente

Campos obrigatórios:

- CPF;
- Nome completo;
- Data de nascimento;
- Endereço.

## Médico

Campos obrigatórios:

- CPF;
- Nome completo;
- Número do CRM;
- Estado de emissão do CRM;
- Data de nascimento;
- Endereço.

## Estrutura recomendada para o endereço

- CEP;
- Logradouro;
- Número;
- Complemento, opcional;
- Bairro;
- Cidade;
- Estado.

## Validações

- CPF válido e único;
- Nome completo sem números;
- Data de nascimento válida e não futura;
- CRM obrigatório;
- Combinação CRM e UF única;
- CEP em formato válido;
- Campos obrigatórios não podem conter somente espaços.

## Autenticação

O CPF poderá ser utilizado como identificador de entrada para pacientes e médicos. As senhas deverão ser armazenadas somente em formato de hash.

Os campos obrigatórios dos atendentes e administradores ainda deverão ser definidos pelo grupo.
