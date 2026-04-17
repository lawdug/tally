import type { ValidationResult } from "../shared";
import { propertyLoader } from "./loader";

/**
 * Thin wrapper. New callers should prefer `propertyLoader.validate(...)`.
 */
export function validatePropertyCanon(input: unknown): ValidationResult {
  return propertyLoader.validate(input);
}
