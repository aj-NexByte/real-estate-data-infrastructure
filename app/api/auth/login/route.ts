import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await signIn(email, password);

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_credentials", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
