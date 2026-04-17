import { readFileSync } from "fs";
import { join } from "path";
import { canonRoot as computeCanonRoot } from "../core";

export interface PropertyCanon {
  version: string;
  issued_at: number;
  property_types: string[];
  tenancy_types: string[];
  cultural_fit_tags: string[];
  lease_durations: string[];
  attestation_types: Record<string, string>;
}

export const DEFAULT_PROPERTY_CANON_PATH = join(__dirname, "canon.json");

export function loadPropertyCanon(
  path: string = DEFAULT_PROPERTY_CANON_PATH
): PropertyCanon {
  return JSON.parse(readFileSync(path, "utf8")) as PropertyCanon;
}

// Pillar canon_root reuses the Core hashing primitives so every pillar
// produces a comparable digest.
export function propertyCanonRoot(canon: unknown): string {
  return computeCanonRoot(canon);
}
