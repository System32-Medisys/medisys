import { loginSchema } from "./validation";

export const INVALID_CREDENTIALS_MESSAGE = "CPF ou senha incorretos. Verifique os dados e tente novamente.";
export const ACCOUNT_LOCKED_MESSAGE = "Conta bloqueada após cinco tentativas.";

export function parseLoginInput(input: unknown) {
  const result = loginSchema.safeParse(input);
  return result.success
    ? { success: true as const, data: result.data }
    : { success: false as const, error: INVALID_CREDENTIALS_MESSAGE };
}

export function getLoginFailureMessage(attempts: number) {
  return attempts >= 5 ? ACCOUNT_LOCKED_MESSAGE : INVALID_CREDENTIALS_MESSAGE;
}
