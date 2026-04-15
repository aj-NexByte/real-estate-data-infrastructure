import { parse } from "csv-parse/sync";

export function parseCsv<T = Record<string, string>>(body: string) {
  return parse(body, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as T[];
}
