import { join } from "path";
import {
  BaseCanonLoader,
  fromErrors,
  isNonEmptyStringArray,
  isPlainObject,
  validateCanonMeta,
  validateStringMap,
} from "../shared";
import type { Canon, ValidationResult } from "../shared";

/**
 * Insurance Pillar canon shape (v0.1).
 *
 * Vocabulary for health, liability, property, travel, and long-term
 * residency coverage issued to cultural residents and families.
 *
 * The canon does NOT encode rates, exclusions, eligibility, or any
 * binding policy term — those live in underwriter policy documents
 * referenced by attestation payloads.
 */
export interface InsuranceCanon extends Canon {
  policy_types: string[];
  coverage_scopes: string[];
  claim_categories: string[];
  term_lengths: string[];
  attestation_types: Record<string, string>;
  notes?: {
    status: string;
    summary?: string;
    upstream?: string;
  };
}

export const DEFAULT_INSURANCE_CANON_PATH = join(__dirname, "canon.json");

const REQUIRED_ARRAY_KEYS: Array<keyof InsuranceCanon> = [
  "policy_types",
  "coverage_scopes",
  "claim_categories",
  "term_lengths",
];

export class InsuranceCanonLoader extends BaseCanonLoader<InsuranceCanon> {
  readonly name = "residency.insurance";
  readonly defaultPath = DEFAULT_INSURANCE_CANON_PATH;

  validate(input: unknown): ValidationResult {
    const errors = validateCanonMeta(input);
    if (!isPlainObject(input)) {
      return fromErrors(errors);
    }
    const c = input as Partial<InsuranceCanon>;

    for (const key of REQUIRED_ARRAY_KEYS) {
      if (!isNonEmptyStringArray(c[key])) {
        errors.push(`${key} must be a non-empty array of strings`);
      }
    }

    errors.push(...validateStringMap(c.attestation_types, "attestation_types"));

    if (c.notes !== undefined) {
      if (!isPlainObject(c.notes)) {
        errors.push("notes must be an object when present");
      } else if (
        typeof c.notes.status !== "string" ||
        c.notes.status.length === 0
      ) {
        errors.push("notes.status must be a non-empty string");
      }
    }

    return fromErrors(errors);
  }
}

export const insuranceLoader = new InsuranceCanonLoader();

export function loadInsuranceCanon(
  path: string = DEFAULT_INSURANCE_CANON_PATH
): InsuranceCanon {
  return insuranceLoader.load(path);
}

export function insuranceCanonRoot(canon: InsuranceCanon): string {
  return insuranceLoader.canonRoot(canon);
}
