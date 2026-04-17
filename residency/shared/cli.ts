import { readFileSync } from "fs";
import type { Canon } from "./types";
import { BaseCanonLoader } from "./base-loader";
import { merkleRoot } from "./merkle";

/**
 * Standard exit codes. Kept stable so shell scripts can branch on them.
 */
export const ExitCodes = {
  OK: 0,
  INVALID_INPUT: 1,
  USAGE_ERROR: 2,
} as const;

interface ParsedArgs {
  command: string | undefined;
  positional: string[];
  flags: Record<string, boolean | string>;
}

function parseArgs(argv: string[]): ParsedArgs {
  // Flags may appear anywhere on the command line. We separate them first,
  // then take the first remaining positional as the command.
  const bareWords: string[] = [];
  const flags: Record<string, boolean | string> = {};
  for (const a of argv) {
    if (a.startsWith("--")) {
      const body = a.slice(2);
      const eq = body.indexOf("=");
      if (eq >= 0) {
        flags[body.slice(0, eq)] = body.slice(eq + 1);
      } else {
        flags[body] = true;
      }
    } else if (a.startsWith("-") && a.length > 1) {
      flags[a.slice(1)] = true;
    } else {
      bareWords.push(a);
    }
  }
  return {
    command: bareWords[0],
    positional: bareWords.slice(1),
    flags,
  };
}

/**
 * Extra command handler. Receives parsed positional args and flags and
 * returns an exit code.
 */
export type ExtraCommand = (
  positional: string[],
  flags: Record<string, boolean | string>
) => number;

export interface CliConfig<T extends Canon> {
  /** Human-readable CLI name used in help output. */
  binName: string;
  loader: BaseCanonLoader<T>;
  /** Additional commands beyond the shared set. */
  extraCommands?: Record<
    string,
    { handler: ExtraCommand; description: string }
  >;
}

function printHelp<T extends Canon>(cfg: CliConfig<T>): void {
  const extra = cfg.extraCommands ?? {};
  const extraLines = Object.entries(extra).map(
    ([name, c]) => `  ${name.padEnd(24)}${c.description}`
  );
  const lines = [
    `${cfg.binName} — canon tooling for ${cfg.loader.name}`,
    "",
    `usage: ${cfg.binName} <command> [args] [--json]`,
    "",
    "commands:",
    "  canon-root              print SHA-256 canon_root of canon.json",
    "  validate                validate canon.json against its schema",
    "  ref                     print CanonRef JSON (name + version + root)",
    "  merkle-root <file>      print SHA-256 Merkle root over a JSON array",
    ...extraLines,
    "  help, --help, -h        show this message",
    "",
    "flags:",
    "  --json                  emit machine-readable JSON on success/failure",
  ];
  console.log(lines.join("\n"));
}

/**
 * Emits a success result. When `jsonMode` is on, strings are JSON-quoted
 * and objects round-trip as compact JSON; otherwise strings print bare and
 * objects print as pretty JSON. Exposed so pillar `extraCommands` don't
 * re-implement output formatting.
 */
export function emit(result: unknown, jsonMode: boolean): void {
  if (jsonMode) {
    console.log(JSON.stringify(result));
  } else if (typeof result === "string") {
    console.log(result);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

/**
 * Emits an error result to stderr. Symmetric with `emit` for `jsonMode`.
 */
export function emitError(
  message: string,
  details: string[],
  jsonMode: boolean
): void {
  if (jsonMode) {
    console.error(JSON.stringify({ ok: false, error: message, details }));
  } else {
    console.error(message);
    for (const d of details) console.error("  - " + d);
  }
}

/**
 * Runs the shared CLI for a given pillar loader.
 *
 * Standard commands:
 *   canon-root | validate | ref | merkle-root <file> | help
 *
 * Pillars may supply `extraCommands` for their own verbs (e.g. the Property
 * pillar's `core-root` command).
 */
export function runCli<T extends Canon>(
  cfg: CliConfig<T>,
  argv: string[]
): number {
  // argv passed in should be the program's own args, i.e. process.argv.slice(2)
  const parsed = parseArgs(argv);
  const jsonMode = parsed.flags["json"] === true;

  if (!parsed.command || parsed.command === "help" || parsed.flags["help"] || parsed.flags["h"]) {
    printHelp(cfg);
    return parsed.command ? ExitCodes.OK : ExitCodes.USAGE_ERROR;
  }

  const cmd = parsed.command;

  try {
    switch (cmd) {
      case "canon-root": {
        const canon = cfg.loader.load();
        emit(cfg.loader.canonRoot(canon), jsonMode);
        return ExitCodes.OK;
      }
      case "validate": {
        const canon = cfg.loader.load();
        const res = cfg.loader.validate(canon);
        if (res.valid) {
          emit(jsonMode ? { ok: true, valid: true } : "valid", jsonMode);
          return ExitCodes.OK;
        }
        emitError(`${cfg.loader.name}: invalid canon`, res.errors, jsonMode);
        return ExitCodes.INVALID_INPUT;
      }
      case "ref": {
        const canon = cfg.loader.load();
        emit(cfg.loader.ref(canon), jsonMode);
        return ExitCodes.OK;
      }
      case "merkle-root": {
        const file = parsed.positional[0];
        if (!file) {
          emitError(
            "merkle-root requires a JSON file path",
            [`usage: ${cfg.binName} merkle-root <file.json> [--json]`],
            jsonMode
          );
          return ExitCodes.USAGE_ERROR;
        }
        const leaves = JSON.parse(readFileSync(file, "utf8"));
        if (!Array.isArray(leaves)) {
          emitError(
            "merkle-root input must be a JSON array of leaves",
            [`file: ${file}`],
            jsonMode
          );
          return ExitCodes.INVALID_INPUT;
        }
        emit(merkleRoot(leaves), jsonMode);
        return ExitCodes.OK;
      }
      default: {
        const extra = cfg.extraCommands?.[cmd];
        if (extra) {
          return extra.handler(parsed.positional, parsed.flags);
        }
        emitError(
          `unknown command: ${cmd}`,
          [`run \`${cfg.binName} help\` for usage`],
          jsonMode
        );
        return ExitCodes.USAGE_ERROR;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    emitError(`${cfg.binName}: ${cmd} failed`, [message], jsonMode);
    return ExitCodes.INVALID_INPUT;
  }
}
