/**
 * Deterministic JSON canonicalization.
 *
 * Rules:
 *  - object keys emitted in lexicographic (UTF-16 code-unit) order
 *  - arrays preserve their original order
 *  - all whitespace stripped
 *  - strings serialised via JSON.stringify (standard JSON escapes)
 *  - `undefined`, functions, symbols, and non-finite numbers are rejected
 *
 * This is the string that gets SHA-256'd to produce a `canon_root` or a
 * Merkle leaf hash. Two parties holding byte-identical source content will
 * compute byte-identical digests regardless of how their JSON was
 * pretty-printed.
 *
 * NOTE: This is a subset of RFC 8785 (JCS). It is deliberately simple and
 * adequate for the closed set of JSON shapes we emit (objects, arrays,
 * strings, integers, booleans, null). For v0.1 we expect only integer
 * numbers in canon documents; floats are permitted but rendered via
 * `Number.prototype.toString` which is non-spec for edge cases. If we start
 * emitting floats we should upgrade to a full JCS implementation.
 */
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
