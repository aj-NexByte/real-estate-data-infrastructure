import Link from "next/link";
import { SavedFilter } from "@prisma/client";
import { Card } from "@/components/ui/card";

export function SavedFiltersCard({ filters }: { filters: SavedFilter[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Saved filters</h2>
          <p className="mt-1 text-sm text-slate-500">Reusable lead lists for acquisition operators.</p>
        </div>
        <Link href="/api/exports/leads" className="text-sm font-medium text-ocean">
          Export all CSV
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {filters.length === 0 ? (
          <p className="text-sm text-slate-500">No saved filters yet.</p>
        ) : (
          filters.map((filter) => {
              const queryEntries = Object.entries(filter.query as Record<string, unknown>).flatMap(([key, value]) =>
                value === null || value === undefined ? [] : [[key, String(value)]]
              );
              const href = `/dashboard?${new URLSearchParams(queryEntries).toString()}`;

              return (
                <Link
                  key={filter.id}
                  href={href as `/dashboard?${string}`}
                  className="block rounded-2xl border border-slate-100 p-4 transition hover:border-ocean/40 hover:bg-slate-50"
                >
                  <p className="font-medium text-slate-900">{filter.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{JSON.stringify(filter.query)}</p>
                </Link>
              );
            })
        )}
      </div>
    </Card>
  );
}
