#!/usr/bin/env ts-node
import { readFileSync } from "fs";
import { loadCoreCanon, canonRoot } from "./canon";
import { validateCoreCanon } from "./validate";
import { merkleRoot } from "./merkle";

function usage(): void {
  const lines = [
    "usage: cli.ts <command> [args]",
    "",
    "commands:",
    "  canon-root              print SHA-256 canon_root of core canon.json",
    "  validate                validate core canon.json against the schema",
    "  merkle-root <file.json> print SHA-256 Merkle root over the JSON array in <file>",
  ];
  console.error(lines.join("\n"));
}

function main(argv: string[]): number {
  const cmd = argv[2];
  switch (cmd) {
    case "canon-root": {
      console.log(canonRoot(loadCoreCanon()));
      return 0;
    }
    case "validate": {
      const res = validateCoreCanon(loadCoreCanon());
      if (res.valid) {
        console.log("valid");
        return 0;
      }
      console.error("invalid:");
      for (const e of res.errors) console.error("  - " + e);
      return 1;
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
