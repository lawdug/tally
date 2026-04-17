// Deterministic JSON canonicalization.
// Object keys are emitted in lexicographic order; arrays preserve order.
// Whitespace is stripped. This is the form that gets hashed for canon_root
// and for every Merkle leaf, so any two parties reach the same digest
// regardless of how their source JSON was formatted.

export function canonicalize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("canonicalize: non-finite number");
    }
    return value.toString();
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalize).join(",") + "]";
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return (
      "{" +
      keys
        .map((k) => JSON.stringify(k) + ":" + canonicalize(obj[k]))
        .join(",") +
      "}"
    );
  }
  throw new Error(`canonicalize: unsupported type ${typeof value}`);
}
