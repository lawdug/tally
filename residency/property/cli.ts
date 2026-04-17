#!/usr/bin/env ts-node
import { readFileSync } from "fs";
import { loadPropertyCanon, propertyCanonRoot } from "./loader";
import { validatePropertyCanon } from "./validate";
import { merkleRoot, canonRoot as coreCanonRoot, loadCoreCanon } from "../core";

function usage(): void {
  const lines = [
    "usage: cli.ts <command> [args]",
    "",
    "commands:",
    "  canon-root              print SHA-256 canon_root of property canon.json",
    "  validate                validate property canon.json against the schema",
    "  core-root               print canon_root of the Core canon this pillar builds on",
    "  merkle-root <file.json> print SHA-256 Merkle root over the JSON array in <file>",
  ];
  console.error(lines.join("\n"));
}

function main(argv: string[]): number {
  const cmd = argv[2];
  switch (cmd) {
    case "canon-root": {
      console.log(propertyCanonRoot(loadPropertyCanon()));
      return 0;
    }
    case "validate": {
      const res = validatePropertyCanon(loadPropertyCanon());
      if (res.valid) {
        console.log("valid");
        return 0;
      }
      console.error("invalid:");
      for (const e of res.errors) console.error("  - " + e);
      return 1;
    }
    case "core-root": {
      console.log(coreCanonRoot(loadCoreCanon()));
      return 0;
    }
    case "merkle-root": {
      const file = argv[3];
      if (!file) {
        console.error("merkle-root requires a JSON file path");
        return 2;
      }
      const leaves = JSON.parse(readFileSync(file, "utf8"));
      if (!Array.isArray(leaves)) {
        console.error("file must contain a JSON array of leaves");
        return 2;
      }
      console.log(merkleRoot(leaves));
      return 0;
    }
    default:
      usage();
      return 2;
  }
}

process.exit(main(process.argv));
