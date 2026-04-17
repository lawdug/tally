# Japan Cultural Residency — Core + Pillars (v0.1)

*Ronnie and Martha School, Limited Company — ram.school*

Infrastructure for long-term cultural immersion residency in Japan. The
architecture follows the same split-tally discipline as the parent **Tally**
project: both parties hold half, the chain holds the truth.

## Split-Tally Architecture

A 14th-century Exchequer tally was one stick, split lengthwise. Creditor kept
the *stock*, debtor kept the *foil*. Neither half could be forged because the
grain had to match.

Each residency artefact in this system is the digital equivalent of a split
tally:

- **Half one** — the **canon** (public vocabulary, rules, schema). Anyone can
  load it and compute its `canon_root`.
- **Half two** — the pillar-specific attestation (housing lease, cultural-fit
  cert, rental bond, etc.). Encrypted off-chain; hashed on-chain as a leaf of
  a Merkle tree rooted in the canon.

Verification = the two halves hash to the same digest. Forgery requires
breaking SHA-256.

## Layout

```
residency/
├── shared/                     Cross-cutting primitives for every pillar
│   ├── types.ts                Canon, ValidationResult, MerkleProof, CanonRef
│   ├── canonicalize.ts         Deterministic JSON (JCS subset)
│   ├── merkle.ts               sha256Hex, hashLeaf, merkleRoot, canonRoot
│   ├── validation.ts           Type guards + shared validators
│   ├── base-loader.ts          BaseCanonLoader<T> (load, canonRoot, ref, ...)
│   ├── cli.ts                  runCli dispatcher + emit/emitError + ExitCodes
│   └── index.ts                Public surface
├── core/                       Japan Cultural Residency Core canon (v0.1)
│   ├── canon.json              residency_types, status, rights_categories,
│   │                           attestation_types
│   ├── loader.ts               CoreCanon + CoreCanonLoader + coreLoader
│   ├── validate.ts             validateCoreCanon (thin wrapper)
│   ├── index.ts
│   └── cli.ts                  canon-root | validate | ref | merkle-root
├── property/                   Property Pillar v0.1
│   ├── canon.json              property_types, tenancy_types,
│   │                           cultural_fit_tags, lease_durations,
│   │                           attestation_types, notes
│   ├── loader.ts               PropertyCanon + PropertyCanonLoader
│   ├── validate.ts             validatePropertyCanon (thin wrapper)
│   ├── index.ts
│   └── cli.ts                  canon-root | validate | ref | merkle-root |
│                               core-root
└── tests/                      node:test suites (46 tests at v0.1)
    ├── canonicalize.test.ts
    ├── merkle.test.ts
    ├── validation.test.ts
    ├── loaders.test.ts
    └── integration.test.ts
```

## How Property Builds on Core

- Both pillars import canonicalization, hashing, and Merkle primitives from
  `residency/shared`. They do not re-implement them. Any pillar that
  duplicates the primitives risks producing incompatible digests.
- Both pillars emit a `canon_root` via the *same* `BaseCanonLoader.canonRoot`
  method, so a third party can compare roots with the same verifier.
- Property extends Core's `attestation_types` with housing-specific types
  (`cultural_fit_cert`, `rental_bond`) without redefining the core set.

Future pillars (Finance, Insurance, Arts Incubator, Rights Portfolio) plug in
the same way — see [Adding a New Pillar](#adding-a-new-pillar).

## Install & Test

```bash
cd residency
npm install
npm run typecheck
npm test
```

## CLI — Usage Examples

Every pillar exposes the same standard verbs. Flags may appear anywhere on
the command line (`--json` and `-h` / `--help` are always accepted).

### Core

```bash
$ npx ts-node core/cli.ts canon-root
5a317642b6a8135fc47fc8f20c571f22a32d55d9f41d5ada80b14e839521e2d7

$ npx ts-node core/cli.ts validate
valid

$ npx ts-node core/cli.ts ref
{
  "name": "residency.core",
  "version": "0.1",
  "canon_root": "5a317642b6a8135fc47fc8f20c571f22a32d55d9f41d5ada80b14e839521e2d7"
}

$ npx ts-node core/cli.ts validate --json
{"ok":true,"valid":true}

$ npx ts-node core/cli.ts help
residency-core — canon tooling for residency.core
...
```

### Property

```bash
$ npx ts-node property/cli.ts canon-root
6a7ea66f7a1d0066f0d4fa2285b1a2ae2801f9de93a290401438399afd4d91d9

$ npx ts-node property/cli.ts validate
valid

$ npx ts-node property/cli.ts ref --json
{"name":"residency.property","version":"0.1","canon_root":"6a7ea66f..."}

# Pillar-specific: print canon_root of the Core canon this pillar targets
$ npx ts-node property/cli.ts core-root
5a317642b6a8135fc47fc8f20c571f22a32d55d9f41d5ada80b14e839521e2d7

# Merkle root over a list of leaves
$ cat > /tmp/claims.json <<'JSON'
[
  {"claim_id":"A-1","status":"submitted"},
  {"claim_id":"A-2","status":"approved"}
]
JSON
$ npx ts-node property/cli.ts merkle-root /tmp/claims.json
3f6c6a...
```

### npm script equivalents

```bash
npm run core:canon-root
npm run core:validate
npm run core:ref
npm run property:canon-root
npm run property:validate
npm run property:ref
npm run property:core-root
```

### Exit codes

| Code | Meaning                         |
|------|---------------------------------|
| 0    | Success                         |
| 1    | Invalid input (validation fail) |
| 2    | Usage error (bad args)          |

## Library Usage

```ts
import { coreLoader } from "./core";
import { propertyLoader } from "./property";
import { merkleRoot, hashLeaf } from "./shared";

const core = coreLoader.loadValidated();     // throws on invalid shape
const prop = propertyLoader.loadValidated();

const coreRef = coreLoader.ref(core);        // { name, version, canon_root }
const propRef = propertyLoader.ref(prop);

// Anchor a batch of claims whose vocabulary is pinned to the canons above
const claims = [
  { claim_id: "A-1", status: "submitted" },
  { claim_id: "A-2", status: "approved" },
];
const anchor = {
  canons: [coreRef, propRef],
  claims_root: merkleRoot(claims),
};
const anchor_root = hashLeaf(anchor);        // the 32-byte hash you'd publish
```

## Canon Root Semantics

```
canon_root = SHA-256( canonicalize(canon) )
```

`canonicalize` produces a deterministic string form of the JSON (object keys
sorted lexicographically, no whitespace, strings JSON-escaped). Two parties
starting from byte-identical canon content reach byte-identical roots.

## Merkle Root Semantics

```
hashLeaf(l)        = SHA-256( canonicalize(l) )
merkleRoot(leaves) = SHA-256 tree over [ hashLeaf(l) for l in leaves ]
```

Odd levels duplicate the trailing node (Bitcoin convention). Leaf **order is
significant** — preserve it in any public record. The empty tree hashes to
`SHA-256("")`.

## Adding a New Pillar

The shared layer makes new pillars small — typically four files.

1. **Create the directory** alongside `property/`, e.g.
   `residency/finance/`.

2. **Write `canon.json`**. Start from the Core `version` / `issued_at`
   discipline; add your domain fields. Mark unfinished vocabulary as
   starter content via a `notes` block:

   ```json
   {
     "version": "0.1",
     "issued_at": 1744896000,
     "notes": {
       "status": "starter set — authoritative data pending",
       "summary": "Finance Pillar v0.1 starter vocabulary.",
       "upstream": "ram.school"
     },
     "instrument_types": ["tally_bond", "escrow"],
     "attestation_types": {
       "bond_issuance": "verifies bond issuance + reserves"
     }
   }
   ```

3. **Write `loader.ts`**. Extend `BaseCanonLoader<T>`:

   ```ts
   import { join } from "path";
   import {
     BaseCanonLoader,
     fromErrors,
     isNonEmptyStringArray,
     isPlainObject,
     validateCanonMeta,
     validateStringMap,
   } from "../shared";
   import type { Canon, ValidationResult } from "../shared";

   export interface FinanceCanon extends Canon {
     instrument_types: string[];
     attestation_types: Record<string, string>;
   }

   export class FinanceCanonLoader extends BaseCanonLoader<FinanceCanon> {
     readonly name = "residency.finance";
     readonly defaultPath = join(__dirname, "canon.json");

     validate(input: unknown): ValidationResult {
       const errors = validateCanonMeta(input);
       if (!isPlainObject(input)) return fromErrors(errors);
       const c = input as Partial<FinanceCanon>;
       if (!isNonEmptyStringArray(c.instrument_types)) {
         errors.push("instrument_types must be a non-empty array of strings");
       }
       errors.push(...validateStringMap(c.attestation_types, "attestation_types"));
       return fromErrors(errors);
     }
   }

   export const financeLoader = new FinanceCanonLoader();
   ```

4. **Write `cli.ts`**. A three-line shim is usually enough:

   ```ts
   #!/usr/bin/env ts-node
   import { runCli } from "../shared";
   import { financeLoader } from "./loader";

   process.exit(runCli({ binName: "residency-finance", loader: financeLoader },
                       process.argv.slice(2)));
   ```

5. **Register the pillar** by adding scripts to `package.json`:

   ```json
   "finance:canon-root": "ts-node finance/cli.ts canon-root",
   "finance:validate":   "ts-node finance/cli.ts validate"
   ```

   Add `finance/**/*` to `tsconfig.json`'s `include`.

6. **Write tests** under `tests/`. At minimum a loader test and an entry in
   `integration.test.ts` verifying your pillar's `canonRoot` matches the
   shared `canonRoot`.

You inherit `load`, `loadValidated`, `canonRoot`, `ref`, the standard CLI
verbs (`canon-root | validate | ref | merkle-root | help`), `--json` and
`--help` support, and the shared exit-code convention. Add pillar-specific
verbs via `extraCommands` (see `property/cli.ts` for the `core-root` example).

## Versioning

Every canon carries `version` and `issued_at` (unix seconds). A new canon is
a new document with a new `canon_root`; the previous root remains anchored to
its artefacts forever. Bump `version` on any field addition, removal, or
semantic change.

## What's *not* here (v0.1)

- Attestation envelope formats (CBOR, COSE) — Section 2.
- On-chain anchoring (OP-Net adapter) — Section 3.
- Merkle inclusion proofs (type is declared in `shared/types.ts`, but
  generation/verification is not yet implemented).
- Any legal, financial, or jurisdiction-specific rules. Everything shipped
  as "starter set" must be replaced before anchoring a public root.

## Status

v0.1 — Section 1 scaffold. Canon + root computation for Core and Property.
Validated by 46 automated tests. Ready to accept Finance, Insurance, Arts
Incubator, and Rights Portfolio pillars against the same shared primitives.
