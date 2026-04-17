// Public surface for the Japan Cultural Residency Core.
// Every pillar (Property, Finance, Insurance, Arts Incubator, Rights Portfolio)
// imports from here so the canonicalization / hashing primitives stay in sync.

export { canonicalize } from "./canonicalize";
export { sha256Hex, hashLeaf, merkleRoot } from "./merkle";
export { DEFAULT_CORE_CANON_PATH, loadCoreCanon, canonRoot } from "./loader";
export type { CoreCanon } from "./loader";
export { validateCoreCanon } from "./validate";
export type { ValidationResult } from "./validate";
