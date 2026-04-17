#!/usr/bin/env ts-node
import { runCli } from "../shared";
import { coreRootExtraCommand } from "../core";
import { propertyLoader } from "./loader";

process.exit(
  runCli(
    {
      binName: "residency-property",
      loader: propertyLoader,
      extraCommands: { "core-root": coreRootExtraCommand() },
    },
    process.argv.slice(2)
  )
);
