import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHmac } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppError } from "./http";
import { db } from "./db";

const COOKIE_NAME = "medisys_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-only-secret-change-me-32-characters",
);

export type Session = { userId: string; role: Role; mustChangePassword: boolean };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

function passwordStamp(passwordHash: string) {
  return createHmac("sha256", secret).update(passwordHash).digest("base64url");
}

export async function createSession(session: Session, passwordHash: string) {
  const token = await new SignJWT({ ...session, passwordStamp: passwordStamp(passwordHash) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<(Session & { passwordStamp?: string }) | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as Session & { passwordStamp?: string };
  } catch {
    return null;
  }
}

export async function requireSession(options?: { allowPasswordChange?: boolean }) {
  const session = await getSession();
  if (!session) throw new AppError(401, "Sessão inválida ou expirada.");
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== "ATIVO" || session.passwordStamp !== passwordStamp(user.passwordHash)) throw new AppError(401, "Sessão inválida ou expirada.");
  if (user.mustChangePassword && !options?.allowPasswordChange) {
    throw new AppError(403, "Troque a senha do primeiro acesso antes de continuar.");
  }
  return { userId: user.id, role: user.role, mustChangePassword: user.mustChangePassword, user };
}

export async function requirePageSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== "ATIVO" || session.passwordStamp !== passwordStamp(user.passwordHash)) redirect("/login");
  if (user.mustChangePassword) redirect("/trocar-senha");
  return { userId: user.id, role: user.role, mustChangePassword: user.mustChangePassword, user };
}

export async function requirePageRole(allowed: readonly Role[]) {
  const session = await requirePageSession();
  if (!allowed.includes(session.role)) redirect("/dashboard");
  return session;
}
