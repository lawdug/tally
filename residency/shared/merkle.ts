import { createHash } from "crypto";
import { canonicalize } from "./canonicalize";

/** SHA-256 of the input, rendered as lowercase hex. */
export function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Hash an arbitrary JSON-serialisable leaf.
 * Canonicalization happens here so every leaf is normalised identically
 * regardless of caller formatting.
 */
export function hashLeaf(leaf: unknown): string {
  return sha256Hex(canonicalize(leaf));
}

/**
 * SHA-256 Merkle root over an ordered list of leaves.
 *
 * Conventions:
 *  - leaf order is significant
 *  - odd levels duplicate the trailing node (Bitcoin convention)
 *  - the empty tree hashes to SHA-256("")
 */
export function merkleRoot(leaves: unknown[]): string {
  if (leaves.length === 0) {
    return sha256Hex("");
  }
  let level = leaves.map(hashLeaf);
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = level[i];
      const b = i + 1 < level.length ? level[i + 1] : a;
      next.push(
        sha256Hex(Buffer.concat([Buffer.from(a, "hex"), Buffer.from(b, "hex")]))
      );
    }
    level = next;
  }
  return level[0];
}

/**
 * SHA-256 canon root over a canonicalised document.
 *
 * Exposed as a named helper so pillars and callers do not have to
 * compose `sha256Hex(canonicalize(...))` by hand (and risk drifting).
 */
export function canonRoot(canon: unknown): string {
  return sha256Hex(canonicalize(canon));
}
