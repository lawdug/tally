import type { ValidationResult } from "../shared";
import { financeLoader } from "./loader";

/**
 * Thin wrapper. New callers should prefer `financeLoader.validate(...)`.
 */
export function validateFinanceCanon(input: unknown): ValidationResult {
  return financeLoader.validate(input);
}
