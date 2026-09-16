"use client";

import { useState } from "react";

export default function CadastroPage() {
  const [tipo, setTipo] = useState<"PACIENTE" | "MEDICO">("PACIENTE");

  return (
    <main className="cadastro-page">
      <section className="cadastro-card">
        <div className="cadastro-header">
          <p className="cadastro-eyebrow">MEDISYS</p>
          <h1>Cadastro de usuário</h1>
          <p>
            Preencha os dados abaixo para cadastrar um paciente ou médico.
          </p>
        </div>

        {/* SELEÇÃO DO TIPO DE CADASTRO */}
        <div className="tipo-selector">
          <button
            type="button"
            className={tipo === "PACIENTE" ? "active" : ""}
            onClick={() => setTipo("PACIENTE")}
          >
            Paciente
          </button>

          <button
            type="button"
            className={tipo === "MEDICO" ? "active" : ""}
            onClick={() => setTipo("MEDICO")}
          >
            Médico
          </button>
        </div>

        <form className="cadastro-form">
          {/* DADOS PESSOAIS */}
          <h2>Dados pessoais</h2>

          <div className="form-grid">
            <label>
              Nome completo
              <input
                type="text"
                placeholder="Digite o nome completo"
                required
              />
            </label>

            {/* CPF COM FORMATAÇÃO AUTOMÁTICA */}
            <label>
              CPF
              <input
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                inputMode="numeric"
                required
                onChange={(e) => {
                  let valor = e.target.value.replace(/\D/g, "");

                  valor = valor.slice(0, 11);

                  valor = valor
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

                  e.target.value = valor;
                }}
              />
            </label>

            {/* DATA DE NASCIMENTO */}
            <label>
              Data de nascimento
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </label>

            <label>
              Telefone
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                required
              />
            </label>

            <label>
              E-mail
              <input
                type="email"
                placeholder="email@exemplo.com"
              />
            </label>

            <label>
              Sexo
              <select defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>

                <option value="Masculino">
                  Masculino
                </option>

                <option value="Feminino">
                  Feminino
                </option>

                <option value="Outro">
                  Outro
                </option>
              </select>
            </label>

            <label>
              Convênio
              <input
                type="text"
                placeholder="Nome do convênio"
              />
            </label>

            <label>
              Senha inicial
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </label>
          </div>

          {/* DADOS EXCLUSIVOS DO MÉDICO */}
          {tipo === "MEDICO" && (
            <>
              <h2>Dados profissionais</h2>

              <div className="form-grid">
                {/* CRM */}
                <label>
                  CRM
                  <input
                    type="text"
                    placeholder="Número do CRM"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    onChange={(e) => {
                      e.target.value =
                        e.target.value.replace(/\D/g, "");
                    }}
                  />
                </label>

                {/* ESTADO DO CRM */}
                <label>
                  UF do CRM
                  <select defaultValue="" required>
                    <option value="" disabled>
                      Selecione
                    </option>

                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                </label>

                <label>
                  Especialidade
                  <select defaultValue="" required>
                    <option value="" disabled>
                      Selecione
                    </option>

                    <option>Cardiologia</option>
                    <option>Clínica Geral</option>
                    <option>Dermatologia</option>
                    <option>Pediatria</option>
                  </select>
                </label>

                <label>
                  Dias de atendimento
                  <input
                    type="text"
                    placeholder="Ex: Segunda, Quarta e Sexta"
                  />
                </label>
              </div>
            </>
          )}

          {/* ENDEREÇO */}
          <h2>Endereço</h2>

          <div className="form-grid">
            <label>
              CEP
              <input
                type="text"
                placeholder="00000-000"
                required
              />
            </label>

            <label>
              Estado
              <input
                type="text"
                maxLength={2}
                placeholder="RO"
                required
              />
            </label>

            <label className="wide">
              Rua
              <input
                type="text"
                placeholder="Nome da rua"
                required
              />
            </label>

            <label>
              Número
              <input
                type="text"
                placeholder="Número"
                required
              />
            </label>

            <label>
              Complemento
              <input
                type="text"
                placeholder="Apto, bloco..."
              />
            </label>

            <label>
              Bairro
              <input
                type="text"
                placeholder="Bairro"
                required
              />
            </label>

            <label>
              Cidade
              <input
                type="text"
                placeholder="Cidade"
                required
              />
            </label>
          </div>

          {/* BOTÕES */}
          <div className="form-actions">
            <button
              type="button"
              className="secondary"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="primary"
            >
              Cadastrar{" "}
              {tipo === "PACIENTE"
                ? "paciente"
                : "médico"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}