import { readFileSync } from "fs";
import type { Canon, CanonRef, ValidationResult } from "./types";
import { canonRoot } from "./merkle";

/**
 * Abstract loader every pillar extends.
 *
 * A pillar supplies:
 *  - `name`        — canonical identifier, e.g. "residency.property"
 *  - `defaultPath` — where canon.json lives on disk
 *  - `validate`    — structural validation against the pillar's shape
 *
 * Shared behaviour (load, canonRoot, ref) is inherited so every pillar
 * produces directly comparable digests.
 */
export abstract class BaseCanonLoader<T extends Canon> {
  abstract readonly name: string;
  abstract readonly defaultPath: string;
  abstract validate(input: unknown): ValidationResult;

  /**
   * Load canon.json from disk and parse it as `T`.
   * Throws if the file is missing or not valid JSON.
   *
   * NOTE: `load` does NOT call `validate`. Callers that care about shape
   * should call `loadValidated` so errors are reported structurally.
   */
  load(path: string = this.defaultPath): T {
    const raw = readFileSync(path, "utf8");
    return JSON.parse(raw) as T;
  }

  /**
   * Load + validate. Throws a single Error aggregating all validation
   * errors when the shape is invalid.
   */
  loadValidated(path: string = this.defaultPath): T {
    const canon = this.load(path);
    const res = this.validate(canon);
    if (!res.valid) {
      throw new Error(
        `${this.name}: canon failed validation:\n  - ${res.errors.join("\n  - ")}`
      );
    }
    return canon;
  }

  /** SHA-256 canon_root of the given canon document. */
  canonRoot(canon: T): string {
    return canonRoot(canon);
  }

  /** Produce a `CanonRef` record suitable for publication / anchoring. */
  ref(canon: T): CanonRef {
    return {
      name: this.name,
      version: canon.version,
      canon_root: this.canonRoot(canon),
    };
  }
}
