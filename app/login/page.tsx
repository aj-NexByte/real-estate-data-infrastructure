import { redirect } from "next/navigation";
import { SetupEmptyState } from "@/components/dashboard/setup-empty-state";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasDatabaseUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!hasDatabaseUrl()) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl p-6">
        <div className="pt-16">
          <SetupEmptyState />
        </div>
      </main>
    );
  }

  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/60 bg-white/85 shadow-panel lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bg-gradient-to-br from-ink via-ocean to-moss p-10 text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">Production MVP</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">Public-record distress intelligence for acquisition operators.</h1>
          <p className="mt-4 max-w-xl text-white/80">
            Ingest county files, normalize lead signals, score motivation, and manage distressed property workflows in one platform.
          </p>
        </section>
        <section className="p-10">
          <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500">Demo credentials: operator@example.com / demo1234 after running the seed script.</p>
          <form action="/api/auth/login" method="POST" className="mt-8 space-y-4">
            <Input type="email" name="email" placeholder="Email" required />
            <Input type="password" name="password" placeholder="Password" required />
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
