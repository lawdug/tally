#!/usr/bin/env ts-node
import { runCli, emit, ExitCodes } from "../shared";
import { coreLoader } from "../core";
import { propertyLoader } from "./loader";

// Property pillar CLI. Shares the standard command set with Core; adds a
// pillar-specific `core-root` verb so the Property CLI can print the Core
// canon_root this pillar builds on (handy for attestation envelopes).
process.exit(
  runCli(
    {
      binName: "residency-property",
      loader: propertyLoader,
      extraCommands: {
        "core-root": {
          description:
            "print canon_root of the Core canon this pillar builds on",
          handler: (_positional, flags) => {
            const root = coreLoader.canonRoot(coreLoader.load());
            const jsonMode = flags["json"] === true;
            emit(jsonMode ? { core_canon_root: root } : root, jsonMode);
            return ExitCodes.OK;
          },
        },
      },
    },
    process.argv.slice(2)
  )
);
