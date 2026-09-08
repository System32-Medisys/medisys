import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
async function main() {
  const specialty = await db.specialty.upsert({ where: { name: "Clínica Geral" }, update: {}, create: { name: "Clínica Geral" } });
  await db.examType.upsert({ where: { name: "Hemograma" }, update: {}, create: { name: "Hemograma", description: "Exame laboratorial de sangue." } });
  await db.user.upsert({ where: { cpf: "52998224725" }, update: {}, create: { cpf: "52998224725", fullName: "Administrador Medisys", birthDate: new Date("1990-01-01"), phone: "69999999999", passwordHash: await bcrypt.hash("123456", 12), role: Role.ADMINISTRADOR, address: { create: { zipCode: "76800000", street: "Rua de Exemplo", number: "100", neighborhood: "Centro", city: "Porto Velho", state: "RO" } } } });
  console.log(`Base criada. Especialidade: ${specialty.name}. Login inicial: 52998224725 / 123456`);
}
main().finally(() => db.$disconnect());
