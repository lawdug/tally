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

## Overview

```
                 ┌─────────────────────────────────────────────┐
                 │  residency/cli.ts  (top-level dispatcher)   │
                 │    list · anchor · <pillar> <command>       │
                 └───────────────────┬─────────────────────────┘
                                     │
        ┌─────────────┬──────────────┼──────────────┬─────────────┐
        ▼             ▼              ▼              ▼             ▼
   ┌────────┐   ┌──────────┐   ┌──────────┐   ┌───────────┐
   │  core  │   │ property │   │ finance  │   │ insurance │    (+ future
   │        │   │          │   │          │   │           │    pillars …)
   │ canon  │   │  canon   │   │  canon   │   │   canon   │
   │ loader │   │  loader  │   │  loader  │   │  loader   │
   │  CLI   │   │   CLI    │   │   CLI    │   │    CLI    │
   └───┬────┘   └────┬─────┘   └────┬─────┘   └─────┬─────┘
       └────────┬────┴────────┬─────┴────────┬──────┘
                ▼             ▼              ▼
            ┌─────────────────────────────────────────┐
            │             residency/shared/            │
            │  canonicalize · merkle · BaseCanonLoader │
            │  validation · types · runCli · emit      │
            └─────────────────────────────────────────┘
```

Every pillar is a thin adapter on top of `shared/`: a typed canon, a
loader that extends `BaseCanonLoader`, a validator, and a CLI shim.
Non-core pillars also expose a `core-root` verb that prints the Core
canon_root they are pinned against.

## Layout

```
residency/
├── cli.ts                      Top-level dispatcher (list / anchor /
│                               <pillar> <command>)
├── shared/                     Cross-cutting primitives for every pillar
│   ├── types.ts                Canon, StarterNotes, ValidationResult,
│   │                           MerkleProof, CanonRef
│   ├── canonicalize.ts         Deterministic JSON (JCS subset)
│   ├── merkle.ts               sha256Hex, hashLeaf, merkleRoot, canonRoot
│   ├── validation.ts           Type guards + validateCanonMeta +
│   │                           validateStringMap + validateStarterNotes
│   ├── base-loader.ts          BaseCanonLoader<T> (load, canonRoot, ref, ...)
│   ├── cli.ts                  runCli dispatcher + emit/emitError + ExitCodes
│   └── index.ts                Public surface
├── core/                       Japan Cultural Residency Core canon (v0.1)
│   ├── canon.json              residency_types, status, rights_categories,
│   │                           attestation_types
│   ├── loader.ts               CoreCanon + CoreCanonLoader + coreLoader
│   ├── cli-helpers.ts          coreRootExtraCommand (reused by pillars)
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
├── finance/                    Finance Pillar v0.1
│   ├── canon.json              instrument_types, fund_sources,
│   │                           currency_rails, flow_directions,
│   │                           attestation_types, notes
│   ├── loader.ts               FinanceCanon + FinanceCanonLoader
│   ├── validate.ts
│   ├── index.ts
│   └── cli.ts
├── insurance/                  Insurance Pillar v0.1
│   ├── canon.json              policy_types, coverage_scopes,
│   │                           claim_categories, term_lengths,
│   │                           attestation_types, notes
│   ├── loader.ts               InsuranceCanon + InsuranceCanonLoader
│   ├── validate.ts
│   ├── index.ts
│   └── cli.ts
└── tests/                      node:test suites (58 tests at v0.1)
    ├── canonicalize.test.ts
    ├── merkle.test.ts
    ├── validation.test.ts
    ├── loaders.test.ts         core + property
    ├── finance.test.ts
    ├── insurance.test.ts
    └── integration.test.ts     cross-pillar digest / anchor sanity
```

## Pillars at a glance

| Pillar    | Canon name            | v0.1 domains                                                            |
|-----------|-----------------------|-------------------------------------------------------------------------|
| Core      | `residency.core`      | residency types, status lifecycle, rights categories, attestation types |
| Property  | `residency.property`  | housing types, tenancy, cultural-fit tags, lease durations              |
| Finance   | `residency.finance`   | grants, remittances, tuition support, banking, escrow, reimbursements   |
| Insurance | `residency.insurance` | health, liability, property, travel, long-term residency, family        |

Every pillar's canon is clearly labelled as **v0.1 starter — authoritative
sources pending** via its `notes` block. None of the canons encode legal,
financial, or policy rules; they are pure descriptive vocabulary. Binding
terms live in referenced documents, not here.

## How Pillars Build on Core

- Every pillar imports canonicalization, hashing, and Merkle primitives from
  `residency/shared`. None of them re-implement these. A pillar that
  duplicated the primitives would risk producing incompatible digests.
- Every pillar emits `canon_root` via the *same* `BaseCanonLoader.canonRoot`
  method, so a third party can compare roots with a single verifier.
- Pillars extend Core's `attestation_types` with domain-specific types
  (Property: `cultural_fit_cert`, `rental_bond`; Finance: `grant_award`,
  `escrow_release`; Insurance: `policy_issuance`, `claim_settlement`, …)
  without redefining the Core set.

Future pillars (Arts Incubator, Rights Portfolio, …) plug in the same way —
see [Adding a New Pillar](#adding-a-new-pillar).

## Install & Test

```bash
cd residency
npm install
npm run typecheck
npm test
```

## CLI — Usage Examples

Two entry points are available:

- **Top-level dispatcher** — `residency/cli.ts`. Good for scripts that
  touch multiple pillars or need the cross-pillar `anchor` / `list`
  verbs.
- **Per-pillar CLIs** — `residency/<pillar>/cli.ts`. Identical command
  surface as going through the dispatcher.

Flags may appear anywhere on the command line (`--json` and `-h` /
`--help` are always accepted).

### Top-level (cross-pillar)

```bash
$ npx ts-node cli.ts list
core        residency.core          5a317642b6a8135fc47fc8f20c571f22a32d55d9f41d5ada80b14e839521e2d7
property    residency.property      6a7ea66f7a1d0066f0d4fa2285b1a2ae2801f9de93a290401438399afd4d91d9
finance     residency.finance       085d516edfbd38823b29c90afbebf66e13c2d812cc9f3b758e3cfd3f4710f6ce
insurance   residency.insurance     5cda760f0a0f87a73b0fcde189f55bcb4073345a698bd24cd14f4895c80a456c

$ npx ts-node cli.ts anchor
residency.core          0.1   5a317642...
residency.property      0.1   6a7ea66f...
residency.finance       0.1   085d516e...
residency.insurance     0.1   5cda760f...
anchor_root                   bb1c154b486b49c3b0fd9c6391a1bff90f1ddd74d3efb727d9d3d3397c7fea3b

$ npx ts-node cli.ts anchor --json
{"canons":[...],"anchor_root":"bb1c154b..."}

# Dispatch through the top-level CLI to a specific pillar
$ npx ts-node cli.ts property canon-root
$ npx ts-node cli.ts finance  validate --json
$ npx ts-node cli.ts insurance core-root
```

`anchor` Merkle-roots the pillar `CanonRef` array in registry order
(`core, property, finance, insurance`) — stable across runs so
third-party verifiers can recompute it. Reordering pillars in the
registry would shift the `anchor_root`, so registry order is part of
the contract.

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

### Property / Finance / Insurance

Every pillar shares the same interface. Substitute the pillar name in the
path:

```bash
$ npx ts-node property/cli.ts canon-root
6a7ea66f7a1d0066f0d4fa2285b1a2ae2801f9de93a290401438399afd4d91d9

$ npx ts-node finance/cli.ts canon-root
085d516edfbd38823b29c90afbebf66e13c2d812cc9f3b758e3cfd3f4710f6ce

$ npx ts-node insurance/cli.ts canon-root
5cda760f0a0f87a73b0fcde189f55bcb4073345a698bd24cd14f4895c80a456c

$ npx ts-node finance/cli.ts validate --json
{"ok":true,"valid":true}

$ npx ts-node insurance/cli.ts ref
{
  "name": "residency.insurance",
  "version": "0.1",
  "canon_root": "5cda760f0a0f87a73b0fcde189f55bcb4073345a698bd24cd14f4895c80a456c"
}

# Every pillar exposes `core-root` — the canon_root of the Core canon
# it is pinned against (useful for attestation envelopes)
$ npx ts-node finance/cli.ts core-root
5a317642b6a8135fc47fc8f20c571f22a32d55d9f41d5ada80b14e839521e2d7

# Merkle root over a list of leaves
$ cat > /tmp/claims.json <<'JSON'
[
  {"claim_id":"A-1","status":"submitted"},
  {"claim_id":"A-2","status":"approved"}
]
JSON
$ npx ts-node property/cli.ts merkle-root /tmp/claims.json
```

### npm script equivalents

```bash
npm run core:canon-root       npm run core:validate       npm run core:ref
npm run property:canon-root   npm run property:validate   npm run property:ref   npm run property:core-root
npm run finance:canon-root    npm run finance:validate    npm run finance:ref    npm run finance:core-root
npm run insurance:canon-root  npm run insurance:validate  npm run insurance:ref  npm run insurance:core-root
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
import { financeLoader } from "./finance";
import { insuranceLoader } from "./insurance";
import { merkleRoot, hashLeaf } from "./shared";

// Throws on invalid shape. Validation errors are aggregated per pillar.
const core      = coreLoader.loadValidated();
const property  = propertyLoader.loadValidated();
const finance   = financeLoader.loadValidated();
const insurance = insuranceLoader.loadValidated();

// A CanonRef is { name, version, canon_root } — the public handle used in
// attestation envelopes.
const canons = [
  coreLoader.ref(core),
  propertyLoader.ref(property),
  financeLoader.ref(finance),
  insuranceLoader.ref(insurance),
];

// Anchor a batch of claims whose vocabulary is pinned to the canons above.
// Leaf order is significant — preserve it in the public record.
const claims = [
  { claim_id: "A-1", status: "submitted" },
  { claim_id: "A-2", status: "approved" },
];

const anchor = {
  canons,
  claims_root: merkleRoot(claims),
};

const anchor_root = hashLeaf(anchor); // the 32-byte hash you'd publish
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

The shared layer makes new pillars small. A full pillar is typically **five
source files** (plus one test file). Use the existing `property/`,
`finance/`, or `insurance/` directories as a reference — they all follow
this exact template.

### 1. Create the directory

```
residency/<pillar>/
  canon.json
  loader.ts
  validate.ts
  index.ts
  cli.ts
```

### 2. Author `canon.json`

Include `version`, `issued_at`, your domain arrays, and an `attestation_types`
map. Mark unfinished vocabulary with a `notes` block so downstream
consumers can distinguish a placeholder from authoritative content:

```json
{
  "version": "0.1",
  "issued_at": 1744896000,
  "notes": {
    "status": "v0.1 starter — authoritative sources pending",
    "summary": "<Pillar> Pillar v0.1 starter vocabulary.",
    "upstream": "ram.school"
  },
  "<domain_array_1>": ["..."],
  "<domain_array_2>": ["..."],
  "attestation_types": {
    "<type>": "<what this attestation verifies>"
  }
}
```

Keep the canon purely descriptive. Rates, eligibility, rules, and other
binding terms belong to policy documents referenced by attestation
payloads, **not** to the canon vocabulary.

### 3. `loader.ts` — extend `BaseCanonLoader<T>`

Reuse the shared `StarterNotes` type and `validateStarterNotes` helper —
the "notes" block shape is identical across every pillar.

```ts
import { join } from "path";
import {
  BaseCanonLoader,
  fromErrors,
  isNonEmptyStringArray,
  isPlainObject,
  validateCanonMeta,
  validateStringMap,
  validateStarterNotes,
} from "../shared";
import type { Canon, StarterNotes, ValidationResult } from "../shared";

export interface ArtsCanon extends Canon {
  medium_types: string[];
  program_formats: string[];
  attestation_types: Record<string, string>;
  notes?: StarterNotes;
}

const REQUIRED_ARRAY_KEYS: Array<keyof ArtsCanon> = [
  "medium_types",
  "program_formats",
];

export class ArtsCanonLoader extends BaseCanonLoader<ArtsCanon> {
  readonly name = "residency.arts";
  readonly defaultPath = join(__dirname, "canon.json");

  validate(input: unknown): ValidationResult {
    const errors = validateCanonMeta(input);
    if (!isPlainObject(input)) return fromErrors(errors);
    const c = input as Partial<ArtsCanon>;
    for (const key of REQUIRED_ARRAY_KEYS) {
      if (!isNonEmptyStringArray(c[key])) {
        errors.push(`${key} must be a non-empty array of strings`);
      }
    }
    errors.push(...validateStringMap(c.attestation_types, "attestation_types"));
    errors.push(...validateStarterNotes(c.notes));
    return fromErrors(errors);
  }
}

export const artsLoader = new ArtsCanonLoader();
```

### 4. `validate.ts` and `index.ts` (thin)

```ts
// validate.ts
import type { ValidationResult } from "../shared";
import { artsLoader } from "./loader";
export function validateArtsCanon(input: unknown): ValidationResult {
  return artsLoader.validate(input);
}

// index.ts
export { artsLoader, ArtsCanonLoader } from "./loader";
export type { ArtsCanon } from "./loader";
export { validateArtsCanon } from "./validate";
```

### 5. `cli.ts` — runCli shim

Use the shared `coreRootExtraCommand()` factory. Every non-core pillar
gets the same `core-root` verb this way, so you don't hand-roll a
handler.

```ts
#!/usr/bin/env ts-node
import { runCli } from "../shared";
import { coreRootExtraCommand } from "../core";
import { artsLoader } from "./loader";

process.exit(
  runCli(
    {
      binName: "residency-arts",
      loader: artsLoader,
      extraCommands: { "core-root": coreRootExtraCommand() },
    },
    process.argv.slice(2)
  )
);
```

### 6. Wire it in

- **`tsconfig.json`** — add `"arts/**/*"` to `include`.
- **`package.json`** — add scripts:
  ```json
  "arts:canon-root": "ts-node arts/cli.ts canon-root",
  "arts:validate":   "ts-node arts/cli.ts validate",
  "arts:ref":        "ts-node arts/cli.ts ref",
  "arts:core-root":  "ts-node arts/cli.ts core-root"
  ```
- **`residency/cli.ts`** — register the pillar in the `REGISTRY`:
  ```ts
  ["arts", { loader: artsLoader as BaseCanonLoader<Canon>, pinsCore: true }],
  ```
  Append at the end — registry order is part of the anchor contract;
  inserting mid-list would shift every downstream `anchor_root`.

### 7. Tests

Add `tests/arts.test.ts` mirroring `tests/finance.test.ts`. Register it in
the `test` script in `package.json`, and extend `tests/integration.test.ts`
to include the new pillar in the "all pillar canon_roots are distinct" and
"multi-pillar anchor" checks.

### What you inherit automatically

- `load`, `loadValidated`, `canonRoot`, `ref` from `BaseCanonLoader`
- Standard CLI verbs: `canon-root | validate | ref | merkle-root | help`
- `--json` output mode and `-h` / `--help` flags (anywhere on the command line)
- Shared exit codes (`0` / `1` / `2`)

Add pillar-specific verbs via `extraCommands` — see any of `property/cli.ts`,
`finance/cli.ts`, or `insurance/cli.ts` for the `core-root` example.

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

v0.1 — Section 1 scaffold. Canon + root computation for Core, Property,
Finance, and Insurance. Validated by 58 automated tests. Arts Incubator
and Rights Portfolio pillars plug into the same shared primitives; see
[Adding a New Pillar](#adding-a-new-pillar).
