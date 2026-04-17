import type { ValidationResult } from "../shared";
import { coreLoader } from "./loader";

/**
 * Thin wrapper kept for backward compatibility. New callers should prefer
 * `coreLoader.validate(...)` directly.
 */
export function validateCoreCanon(input: unknown): ValidationResult {
  return coreLoader.validate(input);
}
