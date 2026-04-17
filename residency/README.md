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
├── core/        Japan Cultural Residency Core v0.1
│   ├── canon.json          vocabulary: residency_types, status,
│   │                       rights_categories, attestation_types
│   ├── canonicalize.ts     deterministic JSON (sorted keys, no whitespace)
│   ├── merkle.ts           SHA-256 leaf hashing + Merkle root
│   ├── loader.ts           canon loader + canon_root
│   ├── validate.ts         schema validation
│   ├── index.ts            public surface for pillars
│   └── cli.ts              canon-root | validate | merkle-root
└── property/    Property Pillar v0.1 — Cultural Housing & Long-Term Residency
    ├── canon.json          property_types, tenancy_types,
    │                       cultural_fit_tags, lease_durations,
    │                       attestation_types
    ├── loader.ts           PropertyCanon + pillar canon_root
    ├── validate.ts         pillar schema validation
    ├── index.ts
    └── cli.ts              canon-root | validate | core-root | merkle-root
```

## How Property Builds on Core

- The Property pillar imports canonicalization, hashing, and Merkle primitives
  from `residency/core`. It does **not** re-implement them. Any pillar that
  duplicates the primitives risks producing incompatible digests.
- Both pillars emit a `canon_root` via the *same* function
  (`core.canonRoot`), so a third party can compare core and pillar roots with
  the same verifier.
- Property extends the core `attestation_types` with housing-specific types
  (`cultural_fit_cert`, `rental_bond`) without redefining the core set.

Future pillars (Finance, Insurance, Arts Incubator, Rights Portfolio) plug in
the same way: add a directory next to `property/`, import from `../core`,
publish their own `canon.json` + pillar `canon_root`.

## CLI

From `residency/`:

```bash
npm install

# Core
npx ts-node core/cli.ts canon-root      # SHA-256 canon_root of core canon
npx ts-node core/cli.ts validate        # structural validation
npx ts-node core/cli.ts merkle-root leaves.json

# Property
npx ts-node property/cli.ts canon-root  # pillar canon_root
npx ts-node property/cli.ts validate    # pillar validation
npx ts-node property/cli.ts core-root   # the core canon_root this pillar targets
npx ts-node property/cli.ts merkle-root leaves.json
```

Or via npm scripts:

```bash
npm run core:canon-root
npm run core:validate
npm run property:canon-root
npm run property:validate
```

## Canon Root Semantics

```
canon_root = SHA-256( canonicalize(canon) )
```

where `canonicalize` produces a deterministic string form of the JSON (object
keys sorted lexicographically, no whitespace, strings JSON-escaped). Two
parties starting from byte-identical canon content reach byte-identical
roots.

## Merkle Root Semantics

```
merkleRoot(leaves) = SHA-256 tree over [ hashLeaf(l) for l in leaves ]
hashLeaf(l)        = SHA-256( canonicalize(l) )
```

Odd levels duplicate the trailing node (Bitcoin convention). Leaf **order is
significant** — preserve it in any public record.

## Versioning

Every canon carries `version` and `issued_at` (unix seconds). A new canon is
a new document with a new `canon_root`; the previous root remains anchored to
its artefacts.

## Status

v0.1 — Section 1 (canon + root computation) for Core and Property. Later
sections (attestation formats, CBOR envelopes, on-chain anchoring) land in
subsequent versions.
