#!/usr/bin/env ts-node
import { runCli } from "../shared";
import { coreRootExtraCommand } from "../core";
import { insuranceLoader } from "./loader";

process.exit(
  runCli(
    {
      binName: "residency-insurance",
      loader: insuranceLoader,
      extraCommands: { "core-root": coreRootExtraCommand() },
    },
    process.argv.slice(2)
  )
);
