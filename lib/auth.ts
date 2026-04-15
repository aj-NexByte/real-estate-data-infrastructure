import { createHmac, timingSafeEqual } from "node:crypto";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { hasDatabaseUrl, serverEnv } from "@/lib/env";

const SESSION_COOKIE = "reai_session";

export async function signIn(email: string, password: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user?.passwordHash) {
    return null;
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, buildSignedSessionValue(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return user;
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  const userId = verifySignedSessionValue(session);

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

function buildSignedSessionValue(userId: string) {
  const secret = serverEnv.NEXTAUTH_SECRET ?? "local-dev-secret";
  const signature = createHmac("sha256", secret).update(userId).digest("hex");
  return `${userId}.${signature}`;
}

function verifySignedSessionValue(value?: string) {
  if (!value) {
    return null;
  }

  const [userId, signature] = value.split(".");
  if (!userId || !signature) {
    return null;
  }

  const expected = buildSignedSessionValue(userId).split(".")[1];

  try {
    const actualBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

    if (actualBuffer.length !== expectedBuffer.length) {
      return null;
    }

    return timingSafeEqual(actualBuffer, expectedBuffer) ? userId : null;
  } catch {
    return null;
  }
}
