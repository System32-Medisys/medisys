import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn(), transaction: vi.fn(), audit: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireSession: async () => ({ userId: "staff", role: "ADMINISTRADOR" }) }));
vi.mock("@/lib/audit", () => ({ audit: mocks.audit }));
vi.mock("@/lib/db", () => ({ db: { user: { findUnique: mocks.findUnique }, $transaction: mocks.transaction } }));
import { PATCH } from "./route";

const payload = {
  cpf: "52998224725", fullName: "Maria da Silva", birthDate: "1990-01-10", phone: "69999999999",
  email: null, sex: null, healthInsurance: null,
  address: { zipCode: "76801000", street: "Rua Principal", number: "100", neighborhood: "Centro", city: "Porto Velho", state: "RO", complement: null },
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.findUnique.mockResolvedValue({ id: "patient", role: "PACIENTE", status: "ATIVO", email: "old@example.test" });
  mocks.transaction.mockImplementation((fn) => fn({ user: { update: mocks.update } }));
  mocks.update.mockResolvedValue({ id: "patient", role: "PACIENTE", email: null });
});
const send = () => PATCH(new Request("http://localhost/api/users/patient", { method: "PATCH", body: JSON.stringify(payload) }), { params: Promise.resolve({ id: "patient" }) });

it("passes explicit removals to the database update and audits the change", async () => {
  expect((await send()).status).toBe(200);
  const data = mocks.update.mock.calls[0][0].data;
  expect(data.email).toBeNull();
  expect(data.sex).toBeNull();
  expect(data.healthInsurance).toBeNull();
  expect(data.address.upsert.update.complement).toBeNull();
  expect(mocks.audit).toHaveBeenCalledOnce();
});
it("still rejects clearing a doctor's required email", async () => {
  mocks.findUnique.mockResolvedValue({ id: "patient", role: "MEDICO", status: "ATIVO" });
  expect((await send()).status).toBe(400);
  expect(mocks.update).not.toHaveBeenCalled();
});
