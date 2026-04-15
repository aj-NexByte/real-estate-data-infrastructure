"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ManualImportForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/imports/manual", {
        method: "POST",
        body: formData
      });

      const payload = await response.json();
      setMessage(payload.message ?? payload.error ?? "Import completed");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-panel">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Upload CSV or XLSX</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use the included template shape or map a county export into the canonical columns before upload.
        </p>
      </div>
      <Input type="file" name="file" accept=".csv,.xlsx,.xls" required />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Importing..." : "Run manual import"}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
