# Dados cadastrais

## Paciente
Obrigatórios: CPF, nome completo, data de nascimento, telefone, endereço e senha.

Opcionais: e-mail, sexo e convênio.

## Médico
Obrigatórios: CPF, nome completo, CRM, UF do CRM, data de nascimento, telefone, e-mail, endereço, especialidade e senha.

Opcional: dias de atendimento.

## Atendente e administrador
Obrigatórios: CPF, nome completo, data de nascimento, telefone, endereço e senha.

## Endereço
CEP, logradouro, número, bairro, cidade e estado. Complemento é opcional.

## Tipo de exame
Nome, descrição e status ativo ou inativo.

## Resultado de exame
- Descrição;
- Data do resultado;
- Usuário que registrou;
- Arquivo opcional;
- Número da versão.

## Validações
- CPF válido e único;
- CRM e UF únicos em conjunto;
- Datas válidas;
- Telefone com 10 ou 11 dígitos;
- E-mail válido;
- Campos obrigatórios preenchidos;
- Senha com no mínimo seis dígitos.

O CPF será o login. A senha será armazenada como hash e alterada no primeiro acesso.
