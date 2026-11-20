import { describe, expect, it } from "vitest";
import { ACCOUNT_LOCKED_MESSAGE, getLoginFailureMessage, INVALID_CREDENTIALS_MESSAGE, parseLoginInput } from "./login-validation";

describe("validação de login", () => {
  it("usa a mensagem escolhida quando o CPF é inválido", () => {
    expect(parseLoginInput({ cpf: "555.555.555-55", password: "senha-segura" })).toEqual({
      success: false,
      error: INVALID_CREDENTIALS_MESSAGE,
    });
    expect(INVALID_CREDENTIALS_MESSAGE).toBe("CPF ou senha incorretos. Verifique os dados e tente novamente.");
  });

  it("usa a mesma mensagem quando os campos não passam na validação", () => {
    expect(parseLoginInput({ cpf: "529.982.247-25", password: "" })).toEqual({
      success: false,
      error: INVALID_CREDENTIALS_MESSAGE,
    });
  });

  it("normaliza o CPF válido antes da autenticação", () => {
    expect(parseLoginInput({ cpf: "529.982.247-25", password: "senha-segura" })).toEqual({
      success: true,
      data: { cpf: "52998224725", password: "senha-segura" },
    });
  });

  it("mantém o aviso específico quando a conta atinge cinco falhas", () => {
    expect(getLoginFailureMessage(4)).toBe(INVALID_CREDENTIALS_MESSAGE);
    expect(getLoginFailureMessage(5)).toBe(ACCOUNT_LOCKED_MESSAGE);
  });
});
