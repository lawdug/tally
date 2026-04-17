// Public surface of residency/shared/.
// Every pillar imports from here; nothing in a pillar should reach into
// shared/* by sub-path.

export type {
  Canon,
  StarterNotes,
  ValidationResult,
  MerkleProof,
  CanonRef,
} from "./types";
export { canonicalize } from "./canonicalize";
export { sha256Hex, hashLeaf, merkleRoot, canonRoot } from "./merkle";
export {
  isNonEmptyString,
  isNonEmptyStringArray,
  isFiniteNumber,
  isPlainObject,
  validateCanonMeta,
  validateStringMap,
  validateStarterNotes,
  ok,
  fromErrors,
} from "./validation";
export { BaseCanonLoader } from "./base-loader";
export type { CliConfig, ExtraCommand } from "./cli";
export { runCli, emit, emitError, ExitCodes } from "./cli";
