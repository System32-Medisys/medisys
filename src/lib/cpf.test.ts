import { describe, expect, it } from "vitest";
import { isValidCpf, normalizeCpf } from "./cpf";
describe("CPF", () => {
  it("normaliza pontuação", () => expect(normalizeCpf("529.982.247-25")).toBe("52998224725"));
  it("valida CPF", () => expect(isValidCpf("529.982.247-25")).toBe(true));
  it("rejeita repetição", () => expect(isValidCpf("111.111.111-11")).toBe(false));
});
