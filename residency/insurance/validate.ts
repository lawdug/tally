import type { ValidationResult } from "../shared";
import { insuranceLoader } from "./loader";

/**
 * Thin wrapper. New callers should prefer `insuranceLoader.validate(...)`.
 */
export function validateInsuranceCanon(input: unknown): ValidationResult {
  return insuranceLoader.validate(input);
}
