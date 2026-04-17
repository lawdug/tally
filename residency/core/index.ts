// Public surface of residency/core/.
// Pillars should import pillar-level primitives from `residency/shared`
// (canonicalize, merkle, BaseCanonLoader). From this module they get the
// Core canon itself and its typed loader.

export {
  DEFAULT_CORE_CANON_PATH,
  CoreCanonLoader,
  coreLoader,
  loadCoreCanon,
  canonRoot,
} from "./loader";
export type { CoreCanon } from "./loader";
export { validateCoreCanon } from "./validate";

// Re-export the shared primitives through core for convenience so
// single-pillar consumers can depend on `residency/core` alone.
export {
  canonicalize,
  sha256Hex,
  hashLeaf,
  merkleRoot,
  BaseCanonLoader,
} from "../shared";
export type {
  Canon,
  ValidationResult,
  MerkleProof,
  CanonRef,
} from "../shared";
