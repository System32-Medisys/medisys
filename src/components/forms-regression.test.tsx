import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FormEvent, ReactElement } from "react";
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useState: (value: unknown) => [value, vi.fn()],
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));
import { CatalogManager } from "./catalog-manager";
import { EditUserForm } from "./edit-user-form";
import { userUpdateSchema } from "../lib/validation";

type Node = ReactElement<{ children?: Node | Node[]; onSubmit?: (event: FormEvent<HTMLFormElement>) => Promise<void> }>;
function findForm(node: Node): Node | undefined {
  if (node.type === "form") return node;
  for (const child of [node.props.children].flat()) {
    if (child && typeof child === "object" && "props" in child) {
      const found = findForm(child);
      if (found) return found;
    }
  }
}
const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("window", { alert: vi.fn(), setTimeout: vi.fn() });
  vi.stubGlobal("FormData", class {
    constructor(private form: { fields: Record<string, string> }) {}
    get(name: string) { return this.form.fields[name] ?? ""; }
    getAll(name: string) { return [this.get(name)].filter(Boolean); }
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("catalog submission", () => {
  it.each([true, false])("resets only after success and survives released currentTarget (success=%s)", async (ok) => {
    fetchMock.mockResolvedValue({ ok, json: async () => ({ error: "Duplicado" }) });
    const node = findForm(CatalogManager({ items: [], kind: "specialty" }) as Node)!;
    const form = { fields: { name: "Clínica Geral" }, reset: vi.fn() };
    const event = { preventDefault: vi.fn(), currentTarget: form };
    const pending = node.props.onSubmit!(event as unknown as FormEvent<HTMLFormElement>);
    // React clears currentTarget after the synchronous event dispatch.
    event.currentTarget = null as unknown as typeof form;
    await expect(pending).resolves.toBeUndefined();
    expect(form.reset).toHaveBeenCalledTimes(ok ? 1 : 0);
  });
  it("preserves the form on network failure", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    const node = findForm(CatalogManager({ items: [], kind: "exam-type" }) as Node)!;
    const form = { fields: { name: "Hemograma", description: "Exame de sangue" }, reset: vi.fn() };
    await node.props.onSubmit!({ preventDefault: vi.fn(), currentTarget: form } as unknown as FormEvent<HTMLFormElement>);
    expect(form.reset).not.toHaveBeenCalled();
  });
});

it("sends explicit nulls when optional registration data is cleared and the schema retains them", async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
  const address = { zipCode: "76801000", street: "Rua Principal", number: "100", neighborhood: "Centro", city: "Porto Velho", state: "RO", complement: "Antigo" };
  const user = { id: "fixture", role: "PACIENTE" as const, cpf: "52998224725", fullName: "Maria da Silva", birthDate: "1990-01-10", phone: "69999999999", email: "antigo@example.test", sex: "F", healthInsurance: "Antigo", specialtyIds: [], address };
  const node = findForm(EditUserForm({ user, specialties: [], destination: "/pacientes" }) as Node)!;
  const fields = { ...user, ...address, email: "", healthInsurance: "", sex: "", complement: "" };
  await node.props.onSubmit!({ preventDefault: vi.fn(), currentTarget: { fields } } as unknown as FormEvent<HTMLFormElement>);
  const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
  const parsed = userUpdateSchema.parse(payload);
  expect(parsed.email).toBeNull();
  expect(parsed.healthInsurance).toBeNull();
  expect(parsed.sex).toBeNull();
  expect(parsed.address.complement).toBeNull();
});
