#!/usr/bin/env ts-node
/**
 * Top-level residency CLI.
 *
 *   residency <pillar> <command> [args] [--json]
 *   residency list
 *   residency anchor [--json]
 *   residency help
 *
 * Dispatches to the registered pillar's CLI with the same command
 * surface (`canon-root | validate | ref | merkle-root | core-root`).
 * The `list` and `anchor` verbs operate across all registered pillars.
 */
import { coreLoader, coreRootExtraCommand } from "./core";
import { propertyLoader } from "./property";
import { financeLoader } from "./finance";
import { insuranceLoader } from "./insurance";
import {
  runCli,
  ExitCodes,
  emit,
  emitError,
  merkleRoot,
} from "./shared";
import type { BaseCanonLoader, Canon, CanonRef } from "./shared";

interface RegistryEntry {
  loader: BaseCanonLoader<Canon>;
  /** Pillars other than Core expose a `core-root` verb. */
  pinsCore: boolean;
}

// Order is stable: downstream consumers may Merkle-root over this array in
// registry order, so reordering here would shift the anchor root.
const REGISTRY: ReadonlyArray<[string, RegistryEntry]> = [
  ["core", { loader: coreLoader as BaseCanonLoader<Canon>, pinsCore: false }],
  ["property", { loader: propertyLoader as BaseCanonLoader<Canon>, pinsCore: true }],
  ["finance", { loader: financeLoader as BaseCanonLoader<Canon>, pinsCore: true }],
  ["insurance", { loader: insuranceLoader as BaseCanonLoader<Canon>, pinsCore: true }],
];

function lookup(name: string): RegistryEntry | undefined {
  return REGISTRY.find(([n]) => n === name)?.[1];
}

function jsonMode(argv: string[]): boolean {
  return argv.includes("--json");
}

function printTopHelp(): void {
  const pillarLines = REGISTRY.map(
    ([name, entry]) => `  ${name.padEnd(12)}${entry.loader.name}`
  );
  const lines = [
    "residency — top-level canon CLI",
    "",
    "usage:",
    "  residency <pillar> <command> [args] [--json]",
    "  residency list                     list registered pillars",
    "  residency anchor [--json]          CanonRef array for every pillar",
    "  residency help, --help, -h         show this message",
    "",
    "pillars:",
    ...pillarLines,
    "",
    "pillar commands:",
    "  canon-root | validate | ref | merkle-root <file> | help",
    "  core-root                          (non-core pillars only)",
  ];
  console.log(lines.join("\n"));
}

function cmdList(json: boolean): number {
  const rows = REGISTRY.map(([key, entry]) => {
    const canon = entry.loader.load();
    return {
      key,
      name: entry.loader.name,
      version: canon.version,
      canon_root: entry.loader.canonRoot(canon),
    };
  });
  emit(json ? rows : rows.map((r) => `${r.key.padEnd(12)}${r.name.padEnd(24)}${r.canon_root}`).join("\n"), json);
  return ExitCodes.OK;
}

function cmdAnchor(json: boolean): number {
  const refs: CanonRef[] = REGISTRY.map(([, entry]) =>
    entry.loader.ref(entry.loader.load())
  );
  if (json) {
    emit({ canons: refs, anchor_root: merkleRoot(refs) }, true);
  } else {
    for (const r of refs) {
      console.log(`${r.name.padEnd(24)}${r.version.padEnd(6)}${r.canon_root}`);
    }
    console.log("anchor_root".padEnd(30) + merkleRoot(refs));
  }
  return ExitCodes.OK;
}

function main(argv: string[]): number {
  // argv here is process.argv.slice(2).
  const first = argv.find((a) => !a.startsWith("-"));
  const json = jsonMode(argv);

  if (!first || first === "help") {
    printTopHelp();
    return first ? ExitCodes.OK : ExitCodes.USAGE_ERROR;
  }
  if (argv.includes("--help") || argv.includes("-h")) {
    // `residency --help` and `residency <pillar> --help` both print top-level
    // help when no pillar is given; pillar-specific help falls through below.
    if (!lookup(first)) {
      printTopHelp();
      return ExitCodes.OK;
    }
  }

  if (first === "list") return cmdList(json);
  if (first === "anchor") return cmdAnchor(json);

  const entry = lookup(first);
  if (!entry) {
    emitError(
      `unknown pillar: ${first}`,
      [`run \`residency help\` for the pillar list`],
      json
    );
    return ExitCodes.USAGE_ERROR;
  }

  // Remove the pillar token from argv and hand the rest to the standard
  // per-pillar dispatcher. Flags (like --json) survive because we filter
  // only the exact pillar token at its first occurrence.
  const idx = argv.indexOf(first);
  const rest = argv.slice(0, idx).concat(argv.slice(idx + 1));

  return runCli(
    {
      binName: `residency ${first}`,
      loader: entry.loader,
      extraCommands: entry.pinsCore
        ? { "core-root": coreRootExtraCommand() }
        : undefined,
    },
    rest
  );
}

process.exit(main(process.argv.slice(2)));
