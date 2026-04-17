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
 * Japan Cultural Residency Core canon shape (v0.1).
 *
 * Shared vocabulary every pillar must reference. Adding or removing a term
 * here is a breaking change: bump `version` and re-derive downstream roots.
 */
export interface CoreCanon extends Canon {
  entities: {
    residency_types: string[];
    status: string[];
    rights_categories: string[];
  };
  attestation_types: Record<string, string>;
}

export const DEFAULT_CORE_CANON_PATH = join(__dirname, "canon.json");

const REQUIRED_ENTITY_KEYS: Array<keyof CoreCanon["entities"]> = [
  "residency_types",
  "status",
  "rights_categories",
];

export class CoreCanonLoader extends BaseCanonLoader<CoreCanon> {
  readonly name = "residency.core";
  readonly defaultPath = DEFAULT_CORE_CANON_PATH;

  validate(input: unknown): ValidationResult {
    const errors = validateCanonMeta(input);
    if (!isPlainObject(input)) {
      return fromErrors(errors);
    }

    const entities = (input as Partial<CoreCanon>).entities;
    if (!isPlainObject(entities)) {
      errors.push("entities must be an object");
    } else {
      for (const key of REQUIRED_ENTITY_KEYS) {
        if (!isNonEmptyStringArray(entities[key])) {
          errors.push(`entities.${key} must be a non-empty array of strings`);
        }
      }
    }

    errors.push(
      ...validateStringMap(
        (input as Partial<CoreCanon>).attestation_types,
        "attestation_types"
      )
    );

    return fromErrors(errors);
  }
}

export const coreLoader = new CoreCanonLoader();

// Functional wrappers for callers that prefer free functions over the
// class instance. Both forms stay in sync because they delegate down.
export function loadCoreCanon(path: string = DEFAULT_CORE_CANON_PATH): CoreCanon {
  return coreLoader.load(path);
}

export function canonRoot(canon: CoreCanon): string {
  return coreLoader.canonRoot(canon);
}
