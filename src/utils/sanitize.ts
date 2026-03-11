const VALID_STATUSES = new Set(["OPEN", "IN_TRANSIT", "DELIVERED"]);

export function sanitizeText(input: string): string {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return (doc.body.textContent ?? "").trim();
}

export function isValidStatus(value: unknown): value is "OPEN" | "IN_TRANSIT" | "DELIVERED" {
  return typeof value === "string" && VALID_STATUSES.has(value);
}

export function encodeId(id: string): string {
  return encodeURIComponent(id);
}

export function sanitizeShipmentInput(data: Record<string, unknown>): Record<string, unknown> {
  const out = { ...data };
  for (const key of ["client_name", "label", "warehouse_id"] as const) {
    if (typeof out[key] === "string") {
      out[key] = sanitizeText(out[key] as string);
    }
  }
  if ("lat" in out) out.lat = Number(out.lat) || 0;
  if ("lng" in out) out.lng = Number(out.lng) || 0;
  if ("status" in out && !isValidStatus(out.status)) {
    out.status = "OPEN";
  }
  return out;
}

export function sanitizeAssignmentInput(data: Record<string, unknown>): Record<string, unknown> {
  const out = { ...data };
  if (typeof out.label === "string") {
    out.label = sanitizeText(out.label as string);
  }
  if ("status" in out && !isValidStatus(out.status)) {
    out.status = "OPEN";
  }
  return out;
}
