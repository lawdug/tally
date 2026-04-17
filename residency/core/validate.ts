import { CoreCanon } from "./canon";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const REQUIRED_ENTITY_KEYS: Array<keyof CoreCanon["entities"]> = [
  "residency_types",
  "status",
  "rights_categories",
];

function isNonEmptyStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string");
}

export function validateCoreCanon(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["canon must be an object"] };
  }
  const c = input as Partial<CoreCanon>;

  if (typeof c.version !== "string" || c.version.length === 0) {
    errors.push("version must be a non-empty string");
  }
  if (typeof c.issued_at !== "number" || !Number.isFinite(c.issued_at)) {
    errors.push("issued_at must be a finite number (unix seconds)");
  }

  if (!c.entities || typeof c.entities !== "object") {
    errors.push("entities must be an object");
  } else {
    for (const key of REQUIRED_ENTITY_KEYS) {
      if (!isNonEmptyStringArray(c.entities[key])) {
        errors.push(`entities.${key} must be a non-empty array of strings`);
      }
    }
  }

  if (!c.attestation_types || typeof c.attestation_types !== "object") {
    errors.push("attestation_types must be an object");
  } else {
    const entries = Object.entries(c.attestation_types);
    if (entries.length === 0) {
      errors.push("attestation_types must not be empty");
    }
    for (const [k, v] of entries) {
      if (typeof v !== "string" || v.length === 0) {
        errors.push(`attestation_types.${k} must be a non-empty string`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
