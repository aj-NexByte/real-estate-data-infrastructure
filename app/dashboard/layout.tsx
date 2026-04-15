import Link from "next/link";
import { requireUser, signOut } from "@/lib/auth";
import { SetupEmptyState } from "@/components/dashboard/setup-empty-state";
import { Button } from "@/components/ui/button";
import { hasDatabaseUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!hasDatabaseUrl()) {
    return (
      <div className="mx-auto min-h-screen max-w-[1500px] px-4 py-6 md:px-8">
        <SetupEmptyState />
      </div>
    );
  }

  const user = await requireUser();

  async function logoutAction() {
    "use server";
    await signOut();
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1500px] px-4 py-6 md:px-8">
      <div className="mb-6 flex flex-col gap-4 rounded-[30px] border border-white/70 bg-white/70 px-5 py-4 shadow-panel md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
            REAI Infra
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-600">
            <Link href="/dashboard">Overview</Link>
            <Link href="/dashboard/leads">Leads</Link>
            <Link href="/dashboard/imports">Imports</Link>
            <Link href="/dashboard/sources">Sources</Link>
            <Link href="/dashboard/settings">Settings</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm text-slate-500">
            <p>{user.name || user.email}</p>
            <p>{user.email}</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
