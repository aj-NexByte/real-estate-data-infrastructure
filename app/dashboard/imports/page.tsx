import { ManualImportForm } from "@/components/sources/manual-import-form";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function ImportsPage() {
  return (
    <main className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <ManualImportForm />
      <Card>
        <h1 className="text-2xl font-semibold text-slate-900">Import workflow</h1>
        <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
          <p>1. Export a county file or broker list into CSV/XLSX.</p>
          <p>2. Match column names to the canonical template in `data/sample/manual-import-template.csv`.</p>
          <p>3. Upload the file here. The manual adapter parses, normalizes, deduplicates, and logs the run.</p>
          <p>4. Review newly created or updated leads in the leads table and dashboard.</p>
        </div>
      </Card>
    </main>
  );
}
