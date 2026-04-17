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
 * Finance Pillar canon shape (v0.1).
 *
 * Covers the vocabulary needed to describe financial flows for long-term
 * cultural residents: grants, remittances, tuition, banking access, escrow.
 * The canon does NOT encode rates, eligibility, or any binding rule —
 * those belong to jurisdiction-specific policy documents referenced by
 * attestation payloads, not by this canon.
 *
 * `notes` is an optional provenance block used on starter canons so
 * downstream consumers can distinguish a placeholder from an
 * authoritative document.
 */
export interface FinanceCanon extends Canon {
  instrument_types: string[];
  fund_sources: string[];
  currency_rails: string[];
  flow_directions: string[];
  attestation_types: Record<string, string>;
  notes?: {
    status: string;
    summary?: string;
    upstream?: string;
  };
}

export const DEFAULT_FINANCE_CANON_PATH = join(__dirname, "canon.json");

const REQUIRED_ARRAY_KEYS: Array<keyof FinanceCanon> = [
  "instrument_types",
  "fund_sources",
  "currency_rails",
  "flow_directions",
];

export class FinanceCanonLoader extends BaseCanonLoader<FinanceCanon> {
  readonly name = "residency.finance";
  readonly defaultPath = DEFAULT_FINANCE_CANON_PATH;

  validate(input: unknown): ValidationResult {
    const errors = validateCanonMeta(input);
    if (!isPlainObject(input)) {
      return fromErrors(errors);
    }
    const c = input as Partial<FinanceCanon>;

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

export const financeLoader = new FinanceCanonLoader();

export function loadFinanceCanon(
  path: string = DEFAULT_FINANCE_CANON_PATH
): FinanceCanon {
  return financeLoader.load(path);
}

export function financeCanonRoot(canon: FinanceCanon): string {
  return financeLoader.canonRoot(canon);
}
