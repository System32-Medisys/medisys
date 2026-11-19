import { describe, expect, it } from "vitest";
import { formatCpfInput, isValidCpf, normalizeCpf } from "./cpf";
describe("CPF", () => {
  it("normaliza pontuação", () => expect(normalizeCpf("529.982.247-25")).toBe("52998224725"));
  it("adds the CPF mask progressively and limits input to 11 digits", () => {
    expect(formatCpfInput("529")).toBe("529");
    expect(formatCpfInput("529982")).toBe("529.982");
    expect(formatCpfInput("529982247")).toBe("529.982.247");
    expect(formatCpfInput("52998224725999")).toBe("529.982.247-25");
  });
  it("ignores non-numeric characters when masking", () => {
    expect(formatCpfInput("529.982a247-25")).toBe("529.982.247-25");
  });
  it("valida CPF", () => expect(isValidCpf("529.982.247-25")).toBe(true));
  it("rejeita repetição", () => expect(isValidCpf("111.111.111-11")).toBe(false));
});
