import { join } from "path";
import {
  BaseCanonLoader,
  fromErrors,
  isNonEmptyStringArray,
  isPlainObject,
  validateCanonMeta,
  validateStringMap,
  validateStarterNotes,
} from "../shared";
import type { Canon, StarterNotes, ValidationResult } from "../shared";

/**
 * Property Pillar canon shape (v0.1) — Cultural Housing & Long-Term Residency.
 *
 * `notes` is a StarterNotes provenance block. Present on starter canons so
 * downstream consumers can distinguish a placeholder from an authoritative
 * document without having to parse the version string.
 */
export interface PropertyCanon extends Canon {
  property_types: string[];
  tenancy_types: string[];
  cultural_fit_tags: string[];
  lease_durations: string[];
  attestation_types: Record<string, string>;
  notes?: StarterNotes;
}

export const DEFAULT_PROPERTY_CANON_PATH = join(__dirname, "canon.json");

const REQUIRED_ARRAY_KEYS: Array<keyof PropertyCanon> = [
  "property_types",
  "tenancy_types",
  "cultural_fit_tags",
  "lease_durations",
];

export class PropertyCanonLoader extends BaseCanonLoader<PropertyCanon> {
  readonly name = "residency.property";
  readonly defaultPath = DEFAULT_PROPERTY_CANON_PATH;

  validate(input: unknown): ValidationResult {
    const errors = validateCanonMeta(input);
    if (!isPlainObject(input)) {
      return fromErrors(errors);
    }
    const c = input as Partial<PropertyCanon>;

    for (const key of REQUIRED_ARRAY_KEYS) {
      if (!isNonEmptyStringArray(c[key])) {
        errors.push(`${key} must be a non-empty array of strings`);
      }
    }

    errors.push(...validateStringMap(c.attestation_types, "attestation_types"));
    errors.push(...validateStarterNotes(c.notes));

    return fromErrors(errors);
  }
}

export const propertyLoader = new PropertyCanonLoader();

export function loadPropertyCanon(
  path: string = DEFAULT_PROPERTY_CANON_PATH
): PropertyCanon {
  return propertyLoader.load(path);
}

export function propertyCanonRoot(canon: PropertyCanon): string {
  return propertyLoader.canonRoot(canon);
}
