export function normalizeWhitespace(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function normalizeAddress(value?: string | null) {
  return normalizeWhitespace(value).toUpperCase();
}

export function normalizeParcel(value?: string | null) {
  return normalizeWhitespace(value).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function normalizeOwnerName(value?: string | null) {
  return normalizeWhitespace(value).toUpperCase();
}

export function parseCurrency(value?: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (!value) {
    return null;
  }

  const cleaned = String(value).replace(/[$,]/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseBooleanLike(value?: string | boolean | null) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = normalizeWhitespace(value).toLowerCase();
  if (["yes", "true", "1", "vacant"].includes(normalized)) {
    return true;
  }

  if (["no", "false", "0", "occupied"].includes(normalized)) {
    return false;
  }

  return null;
}

export function parseDateValue(value?: string | Date | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
