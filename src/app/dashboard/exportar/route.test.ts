import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConsultationStatus, ExamStatus, Role } from "@prisma/client";

vi.mock("@/lib/auth", () => ({ requireSession: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    user: { findFirst: vi.fn() },
    examType: { findFirst: vi.fn() },
    consultation: { groupBy: vi.fn() },
    examAppointment: { groupBy: vi.fn() },
  },
}));

import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppError } from "@/lib/http";
import { GET } from "./route";

const session = vi.mocked(requireSession);
const findDoctor = vi.mocked(db.user.findFirst);
const findExamType = vi.mocked(db.examType.findFirst);
const consultations = vi.mocked(db.consultation.groupBy);
const exams = vi.mocked(db.examAppointment.groupBy);

function request(params = "") {
  return new Request("http://localhost:3000/dashboard/exportar" + (params ? "?" + params : ""));
}

function asRole(role: Role, userId = "usuario-teste") {
  // Simula a sessão autenticada devolvida pelo middleware; não consulta contas reais.
  session.mockResolvedValue({ role, userId } as Awaited<ReturnType<typeof requireSession>>);
}

describe("exportação do dashboard: perfis e filtros", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    consultations.mockResolvedValue([
      { status: ConsultationStatus.REALIZADA, _count: { _all: 2 } },
    ] as never);
    exams.mockResolvedValue([
      { status: ExamStatus.RESULTADO_PENDENTE, _count: { _all: 1 } },
    ] as never);
  });

  it("bloqueia usuário sem sessão e não consulta os agregados", async () => {
    session.mockRejectedValue(new AppError(401, "Sessão inválida ou expirada."));
    const response = await GET(request());
    expect(response.status).toBe(401);
    expect(consultations).not.toHaveBeenCalled();
    expect(exams).not.toHaveBeenCalled();
  });

  it("paciente exporta somente suas consultas e exames", async () => {
    asRole(Role.PACIENTE, "paciente-1");
    const response = await GET(request("periodo=semana&medico=outro-medico&tipoExame=outro-tipo"));
    expect(response.status).toBe(200);
    expect(consultations.mock.calls[0][0].where).toMatchObject({ patientId: "paciente-1" });
    expect(exams.mock.calls[0][0].where).toMatchObject({ patientId: "paciente-1" });
    expect(consultations.mock.calls[0][0].where).not.toHaveProperty("doctorId");
    expect(exams.mock.calls[0][0].where).not.toHaveProperty("examTypeId");
    expect(findDoctor).not.toHaveBeenCalled();
    expect(findExamType).not.toHaveBeenCalled();
  });

  it("médico só pode exportar consultas próprias", async () => {
    asRole(Role.MEDICO, "medico-1");
    const response = await GET(request("medico=medico-2"));
    expect(response.status).toBe(200);
    expect(consultations.mock.calls[0][0].where).toMatchObject({ doctorId: "medico-1" });
    expect(findDoctor).not.toHaveBeenCalled();
    // A regra atual do Medisys permite ao médico acessar os exames;
    // não há doctorId no modelo ExamAppointment.
    expect(exams.mock.calls[0][0].where).not.toHaveProperty("doctorId");
  });

  it.each([Role.ATENDENTE, Role.ADMINISTRADOR])(
    "%s aplica filtros administrativos validados e gera CSV agregado",
    async (role) => {
      asRole(role);
      findDoctor.mockResolvedValue({ id: "medico-1" } as never);
      findExamType.mockResolvedValue({ id: "tipo-1" } as never);
      const response = await GET(request(
        "periodo=mes&medico=medico-1&tipoExame=tipo-1&statusConsulta=REALIZADA&statusExame=RESULTADO_PENDENTE",
      ));
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("text/csv");
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
      expect(response.headers.get("Content-Disposition")).toContain("attachment");
      expect(consultations.mock.calls[0][0].where).toMatchObject({
        doctorId: "medico-1", status: ConsultationStatus.REALIZADA,
      });
      expect(exams.mock.calls[0][0].where).toMatchObject({
        examTypeId: "tipo-1", status: ExamStatus.RESULTADO_PENDENTE,
      });
      const bytes = new Uint8Array(await response.arrayBuffer());
      // Response.text() remove o BOM UTF-8 durante a decodificação.
      expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
      const csv = new TextDecoder().decode(bytes);
      expect(csv).toContain('"Consulta";"mes";"REALIZADA";"2"');
      expect(csv).toContain('"Exame";"mes";"RESULTADO_PENDENTE";"1"');
      expect(csv).not.toContain("paciente-1");
    },
  );

  it("ignora IDs e estados inválidos sem ampliar permissões", async () => {
    asRole(Role.ADMINISTRADOR);
    findDoctor.mockResolvedValue(null);
    findExamType.mockResolvedValue(null);
    const response = await GET(request(
      "periodo=desconhecido&medico=incorreto&tipoExame=incorreto&statusConsulta=INVALIDO&statusExame=INVALIDO",
    ));
    expect(response.status).toBe(200);
    const consultationWhere = consultations.mock.calls[0][0].where;
    const examWhere = exams.mock.calls[0][0].where;
    expect(consultationWhere).not.toHaveProperty("doctorId");
    expect(consultationWhere).not.toHaveProperty("status");
    expect(examWhere).not.toHaveProperty("examTypeId");
    expect(examWhere).not.toHaveProperty("status");
    expect(await response.text()).toContain('"Consulta";"hoje"');
  });
});
