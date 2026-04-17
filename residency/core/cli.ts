#!/usr/bin/env ts-node
import { runCli } from "../shared";
import { coreLoader } from "./loader";

process.exit(
  runCli(
    {
      binName: "residency-core",
      loader: coreLoader,
    },
    process.argv.slice(2)
  )
);
