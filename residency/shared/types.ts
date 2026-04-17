/**
 * Cross-cutting types shared by every pillar (Core, Property, Finance,
 * Insurance, Arts Incubator, Rights Portfolio, ...).
 *
 * The goal: a new pillar defines its domain-specific canon shape and plugs
 * into the shared loader / validator / CLI dispatcher without re-inventing
 * the primitives.
 */

/**
 * Every canon document — core or pillar — carries at least a schema version
 * and an issuance timestamp. Pillar canons extend this with their own fields.
 */
export interface Canon {
  /** Semver-ish schema version string, e.g. "0.1". */
  version: string;
  /** Issuance time in unix seconds (UTC). */
  issued_at: number;
}

/**
 * Result of validating any structured document against its expected shape.
 * `errors` is empty iff `valid` is true.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * A proof that a given leaf participates in a Merkle tree with a known root.
 *
 * `siblings` are ordered from the leaf's level up to just below the root.
 * `path` is the sequence of left/right positions of the leaf at each level
 * (`"L"` means the leaf/intermediate sat on the left at that level and the
 * sibling is on the right, and vice versa).
 *
 * Not yet emitted by the v0.1 CLIs — included here so pillar code can start
 * referencing the canonical shape.
 */
export interface MerkleProof {
  leaf: unknown;
  leafHash: string;
  root: string;
  siblings: string[];
  path: Array<"L" | "R">;
}

/**
 * Lightweight descriptor for a canon document that may be stored elsewhere
 * (git, IPFS, on-chain). Useful as a pillar's public reference to Core.
 */
export interface CanonRef {
  /** Canonical name, e.g. "residency.core" or "residency.property". */
  name: string;
  version: string;
  canon_root: string;
}
