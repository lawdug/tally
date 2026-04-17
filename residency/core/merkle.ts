import { createHash } from "crypto";
import { canonicalize } from "./canonicalize";

export function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

// Hash an arbitrary JSON-serialisable leaf. Callers always pass raw values —
// canonicalization happens here so every leaf is normalised identically.
export function hashLeaf(leaf: unknown): string {
  return sha256Hex(canonicalize(leaf));
}

// SHA-256 Merkle root over an ordered list of leaves.
// Odd levels duplicate the trailing node (Bitcoin convention) so every
// internal node has two children. Leaf order is significant.
export function merkleRoot(leaves: unknown[]): string {
  if (leaves.length === 0) {
    // Convention: empty tree hashes to SHA-256 of the empty string.
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
