import { SourceAdapter } from "@/lib/adapters/base/types";
import { csvTaxLienAdapter } from "@/lib/adapters/samples/csv-tax-lien";
import { htmlCodeViolationAdapter } from "@/lib/adapters/samples/html-code-violation";
import { manualUploadAdapter } from "@/lib/adapters/samples/manual-upload";

const adapters: SourceAdapter[] = [csvTaxLienAdapter, htmlCodeViolationAdapter, manualUploadAdapter];

export function getAdapter(adapterKey: string) {
  const adapter = adapters.find((candidate) => candidate.key === adapterKey);

  if (!adapter) {
    throw new Error(`Adapter not found for key "${adapterKey}"`);
  }

  return adapter;
}

export function listAdapters() {
  return adapters;
}
