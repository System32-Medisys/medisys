import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), updateMany: vi.fn(), update: vi.fn(),
  transaction: vi.fn(), verifyPassword: vi.fn(), createSession: vi.fn(), audit: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ db: {
  user: { findUnique: mocks.findUnique, updateMany: mocks.updateMany }, $transaction: mocks.transaction,
} }));
vi.mock("@/lib/auth", () => ({ verifyPassword: mocks.verifyPassword, createSession: mocks.createSession }));
vi.mock("@/lib/audit", () => ({ audit: mocks.audit }));
import { POST } from "./route";

const request = () => new Request("http://localhost/api/auth/login", {
  method: "POST", body: JSON.stringify({ cpf: "52998224725", password: "test-password" }),
});
let user: { id: string; role: string; status: string; passwordHash: string; failedLoginCount: number; mustChangePassword: boolean };

beforeEach(() => {
  vi.resetAllMocks();
  user = { id: "fixture", role: "PACIENTE", status: "ATIVO", passwordHash: "hash-1", failedLoginCount: 0, mustChangePassword: false };
  mocks.findUnique.mockImplementation(async () => ({ ...user }));
  mocks.findUniqueOrThrow.mockImplementation(async () => ({ ...user }));
  mocks.updateMany.mockImplementation(async ({ where, data }) => {
    if (where.status !== user.status || where.passwordHash !== user.passwordHash) return { count: 0 };
    user.failedLoginCount = typeof data.failedLoginCount === "number"
      ? data.failedLoginCount : user.failedLoginCount + data.failedLoginCount.increment;
    return { count: 1 };
  });
  mocks.update.mockImplementation(async ({ data }) => { Object.assign(user, data); return { ...user }; });
  // Model the row lock acquired by UPDATE until the transaction commits.
  let queue = Promise.resolve();
  mocks.transaction.mockImplementation((callback) => {
    const result = queue.then(() => callback({ user: { updateMany: mocks.updateMany, findUniqueOrThrow: mocks.findUniqueOrThrow, update: mocks.update } }));
    queue = result.then(() => undefined, () => undefined);
    return result;
  });
  mocks.verifyPassword.mockResolvedValue(false);
  mocks.audit.mockResolvedValue(undefined);
});

describe("login counter and account changes", () => {
  it("blocks after five simultaneous incorrect passwords without lost increments", async () => {
    const responses = await Promise.all(Array.from({ length: 5 }, () => POST(request())));
    expect(responses.every((response) => response.status === 401)).toBe(true);
    expect(user.failedLoginCount).toBe(5);
    expect(user.status).toBe("BLOQUEADO");
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.audit.mock.calls.filter(([event]) => event.action === "CONTA_BLOQUEADA")).toHaveLength(1);
  });
  it("keeps an active account after four failures and resets on valid login", async () => {
    for (let i = 0; i < 4; i++) expect((await POST(request())).status).toBe(401);
    expect(user.status).toBe("ATIVO");
    expect(user.failedLoginCount).toBe(4);
    mocks.verifyPassword.mockResolvedValue(true);
    expect((await POST(request())).status).toBe(200);
    expect(user.failedLoginCount).toBe(0);
    expect(mocks.createSession).toHaveBeenCalledOnce();
  });
  it.each(["BLOQUEADO", "INATIVO"])("does not create a session when the account becomes %s during password verification", async (status) => {
    mocks.verifyPassword.mockImplementation(async () => { user.status = status; return true; });
    expect((await POST(request())).status).toBe(401);
    expect(user.status).toBe(status);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it.each([true, false])("does not change attempts or create a session after a concurrent password reset (valid=%s)", async (valid) => {
    mocks.verifyPassword.mockImplementation(async () => { user.passwordHash = "new-hash"; return valid; });
    expect((await POST(request())).status).toBe(401);
    expect(user.failedLoginCount).toBe(0);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it("rejects an already blocked account before checking the password", async () => {
    user.status = "BLOQUEADO";
    expect((await POST(request())).status).toBe(423);
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
  });
});
