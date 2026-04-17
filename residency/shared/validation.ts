import type { ValidationResult } from "./types";

/**
 * Small helpers used by every pillar validator. Centralised here so that a
 * pillar cannot drift in how, say, "non-empty string array" is defined.
 */

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

export function isNonEmptyStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.length > 0 && v.every(isNonEmptyString);
}

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Validates the `version` + `issued_at` fields required on every canon.
 * Returns the list of errors (empty on success) so pillar validators can
 * concatenate with their own domain checks.
 */
export function validateCanonMeta(input: unknown): string[] {
  const errors: string[] = [];
  if (!isPlainObject(input)) {
    errors.push("canon must be an object");
    return errors;
  }
  if (!isNonEmptyString(input.version)) {
    errors.push("version must be a non-empty string");
  }
  if (!isFiniteNumber(input.issued_at)) {
    errors.push("issued_at must be a finite number (unix seconds)");
  }
  return errors;
}

/**
 * Validates a `Record<string, string>` map of attestation types.
 * Returns errors using the given field name so messages stay meaningful.
 */
export function validateStringMap(
  value: unknown,
  field: string,
  { allowEmpty = false }: { allowEmpty?: boolean } = {}
): string[] {
  const errors: string[] = [];
  if (!isPlainObject(value)) {
    errors.push(`${field} must be an object`);
    return errors;
  }
  const entries = Object.entries(value);
  if (!allowEmpty && entries.length === 0) {
    errors.push(`${field} must not be empty`);
  }
  for (const [k, v] of entries) {
    if (!isNonEmptyString(v)) {
      errors.push(`${field}.${k} must be a non-empty string`);
    }
  }
  return errors;
}

/**
 * Validates an optional `notes` starter-provenance block. Pillar canons
 * carry this as `notes?: StarterNotes`. If absent the check is a no-op.
 * If present the shape is validated.
 */
export function validateStarterNotes(value: unknown): string[] {
  if (value === undefined) return [];
  if (!isPlainObject(value)) {
    return ["notes must be an object when present"];
  }
  const errors: string[] = [];
  if (!isNonEmptyString(value.status)) {
    errors.push("notes.status must be a non-empty string");
  }
  if (value.summary !== undefined && !isNonEmptyString(value.summary)) {
    errors.push("notes.summary must be a non-empty string when present");
  }
  if (value.upstream !== undefined && !isNonEmptyString(value.upstream)) {
    errors.push("notes.upstream must be a non-empty string when present");
  }
  return errors;
}

export function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

export function fromErrors(errors: string[]): ValidationResult {
  return { valid: errors.length === 0, errors };
}
