import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-5 rounded-[32px] border border-white/60 bg-gradient-to-r from-ink via-ocean to-moss p-8 text-white shadow-panel md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/70">Real Estate AI Data Infrastructure</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Distressed property signals, normalized into one operating system.</h1>
        <p className="mt-3 text-sm text-white/80 md:text-base">
          Ingest county records, resolve duplicates, score motivation, and manage outreach from a single dashboard.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/imports">
          <Button variant="secondary">Manual import</Button>
        </Link>
        <Link href="/dashboard/settings">
          <Button className="bg-white/15 hover:bg-white/20">Source settings</Button>
        </Link>
      </div>
    </header>
  );
}
