import { emit, ExitCodes } from "../shared";
import type { ExtraCommand } from "../shared";
import { coreLoader } from "./loader";

/**
 * Shared extra-command factory: prints the Core canon_root that a pillar
 * is pinned against. Pillars wire this in via their CLI's `extraCommands`
 * so every pillar CLI exposes a consistent `core-root` verb.
 */
export function coreRootExtraCommand(): {
  handler: ExtraCommand;
  description: string;
} {
  return {
    description:
      "print canon_root of the Core canon this pillar builds on",
    handler: (_positional, flags) => {
      const root = coreLoader.canonRoot(coreLoader.load());
      const jsonMode = flags["json"] === true;
      emit(jsonMode ? { core_canon_root: root } : root, jsonMode);
      return ExitCodes.OK;
    },
  };
}
