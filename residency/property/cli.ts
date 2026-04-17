#!/usr/bin/env ts-node
import { runCli, ExitCodes } from "../shared";
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
            const canon = coreLoader.load();
            const root = coreLoader.canonRoot(canon);
            if (flags["json"] === true) {
              console.log(JSON.stringify({ core_canon_root: root }));
            } else {
              console.log(root);
            }
            return ExitCodes.OK;
          },
        },
      },
    },
    process.argv.slice(2)
  )
);
