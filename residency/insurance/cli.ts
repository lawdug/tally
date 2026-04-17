#!/usr/bin/env ts-node
import { runCli, emit, ExitCodes } from "../shared";
import { coreLoader } from "../core";
import { insuranceLoader } from "./loader";

// Insurance pillar CLI. Shares the standard command set with every
// pillar; adds a `core-root` verb for attestation envelopes that need
// to cite the Core canon this pillar is pinned against.
process.exit(
  runCli(
    {
      binName: "residency-insurance",
      loader: insuranceLoader,
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
