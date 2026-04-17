#!/usr/bin/env ts-node
import { runCli } from "../shared";
import { coreRootExtraCommand } from "../core";
import { financeLoader } from "./loader";

process.exit(
  runCli(
    {
      binName: "residency-finance",
      loader: financeLoader,
      extraCommands: { "core-root": coreRootExtraCommand() },
    },
    process.argv.slice(2)
  )
);
