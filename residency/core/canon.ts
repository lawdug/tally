import { readFileSync } from "fs";
import { join } from "path";
import { canonicalize } from "./canonicalize";
import { sha256Hex } from "./merkle";

export interface CoreCanon {
  version: string;
  issued_at: number;
  entities: {
    residency_types: string[];
    status: string[];
    rights_categories: string[];
  };
  attestation_types: Record<string, string>;
}

export const DEFAULT_CORE_CANON_PATH = join(__dirname, "canon.json");

export function loadCoreCanon(path: string = DEFAULT_CORE_CANON_PATH): CoreCanon {
  return JSON.parse(readFileSync(path, "utf8")) as CoreCanon;
}

// canon_root = SHA-256 of the canonical JSON serialisation of the canon.
// Any pillar (Property, Finance, Insurance, Arts Incubator, Rights Portfolio)
// that references this root is pinned to the exact vocabulary below.
export function canonRoot(canon: unknown): string {
  return sha256Hex(canonicalize(canon));
}
