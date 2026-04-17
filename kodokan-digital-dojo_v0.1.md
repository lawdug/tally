# Kodokan Digital Dojo — v0.1

Martial-arts fraternal twin to Metalaw. Two-layer discipline:
**symbol layer** (compact notation) + **discourse layer** (full technique / command / philosophy names).
On-chain anchoring readiness. Granule-level precision.

Source of truth for this track: `kodokan-judo-scorekeeper-menu.md`
(Historical Kodokan chart, Meiji/Taisho era, hard copy from Kodokan Tokyo.)

---

## Section 1 — Structured Extraction (JSON)

Source integrity note: the source JSON export terminates mid-token at `"kansetsu"`.
The consolidated reference sections above that break are complete.
No techniques, commands, or maxims have been fabricated; `etc.` markers are preserved
wherever the source signaled a non-exhaustive list, so the schema stays faithful
and future entries can be appended without rewriting prior records.

```json
{
  "document": {
    "title": "Kodokan Judo Techniques & Referee / Scorekeeper Reference Menu",
    "source": "Hard copy given to adult men's judo members at the Kodokan, Tokyo",
    "era": "Meiji/Taisho (early standardization period)",
    "purpose": "Official syllable-organized lookup table used by referees and scorekeepers to name, categorize, and record techniques in official matches for the permanent Kodokan library records.",
    "integrity_note": "Source JSON export truncated mid-token at 'kansetsu'. Entries below are verbatim from the consolidated reference sections and the intact portion of the JSON export. No techniques fabricated; 'etc.' markers preserved where the source indicated non-exhaustive lists."
  },
  "techniques": {
    "nagewaza": {
      "gloss": "Throwing techniques",
      "entries": [
        "Uki-otoshi", "Tai-otoshi", "Yoko-otoshi", "Sumi-otoshi",
        "Soto-makikomi", "Uchi-makikomi", "Kuchiki-taoshi", "Uki-waza",
        "Kibisu-gaeshi", "Daki-wakare", "O-soto-makikomi", "Uki-goshi",
        "Uchi-mata-makikomi", "Harai-makikomi", "Ko-uchi-makikomi",
        "Ippon-seoinage"
      ],
      "list_terminator": "etc."
    },
    "newaza": {
      "gloss": "Ground techniques",
      "osaekomi_waza": {
        "gloss": "Holds / pins",
        "entries": ["Kesa-gatame", "Kata-gatame", "Kami-shiho-gatame"],
        "list_terminator": "etc."
      },
      "shime_waza": {
        "gloss": "Strangles",
        "entries": [
          "Kata-juji-shime", "Hadaka-jime", "Okuri-eri-jime",
          "Kataha-jime", "Gyaku-juji-jime", "Ryo-te-jime"
        ],
        "list_terminator": "etc."
      },
      "kansetsu_waza": {
        "gloss": "Joint locks",
        "entries": ["Ude-hishigi-waki-gatame"],
        "list_terminator": "etc. (source JSON truncated here)"
      }
    }
  },
  "kata": {
    "gloss": "Forms",
    "entries": ["Katame-no-Kata", "Kime-no-Kata", "Itsutsu-no-Kata"],
    "list_terminator": "etc."
  },
  "referee_scorekeeper_commands": [
    {"term": "Hajime",      "role": "start of match / resume action"},
    {"term": "Matte",       "role": "pause / wait"},
    {"term": "Yame",        "role": "stop / end of action"},
    {"term": "Waza-ari",    "role": "partial score call"},
    {"term": "Ippon",       "role": "full point / match-ending score"},
    {"term": "Fusen-gachi", "role": "win by default / non-appearance"}
  ],
  "core_philosophy": [
    {"term": "Seiryoku-Zenyo", "gloss": "Maximum efficient use of energy"},
    {"term": "Jita-Kyoei",     "gloss": "Mutual welfare and benefit"},
    {"maxim": "Do your best and await the result"}
  ]
}
```

---

## Section 2 — Compact Notation System (symbol layer)

### Design principles
- **Chess-notation-like**: one line per scored event, human-skimmable, machine-parseable.
- **Granule-level**: each token is atomic — category, technique, actor, outcome, time.
- **Two-layer discipline**: every symbol token maps 1:1 to a discourse-layer canonical
  name in the Section 1 JSON. No symbol exists without a named referent.
- **On-chain ready**: line is ASCII, ≤80 bytes typical, hash-stable, append-only.

### Category prefixes
```
N    Nagewaza          (throwing)
Go   Ground — osaekomi (pin)
Gs   Ground — shime    (strangle)
Gk   Ground — kansetsu (joint lock)
K    Kata              (form)
C    Command           (referee / scorekeeper verb)
P    Philosophy anchor (Seiryoku-Zenyo / Jita-Kyoei / maxim)
```

### Technique codes
Throws:
```
Nuo   Uki-otoshi           Nto   Tai-otoshi          Nyo   Yoko-otoshi
Nso   Sumi-otoshi          Nsmk  Soto-makikomi       Numk  Uchi-makikomi
Nkt   Kuchiki-taoshi       Nuw   Uki-waza            Nkg   Kibisu-gaeshi
Ndw   Daki-wakare          Nosm  O-soto-makikomi     Nug   Uki-goshi
Numm  Uchi-mata-makikomi   Nhm   Harai-makikomi      Nkom  Ko-uchi-makikomi
Nis   Ippon-seoinage
```
Ground:
```
Go:kg  Kesa-gatame          Go:kt  Kata-gatame         Go:ksg Kami-shiho-gatame
Gs:kjs Kata-juji-shime      Gs:hj  Hadaka-jime         Gs:oej Okuri-eri-jime
Gs:khj Kataha-jime          Gs:gjj Gyaku-juji-jime     Gs:rtj Ryo-te-jime
Gk:uhw Ude-hishigi-waki-gatame
```
Kata / commands / philosophy:
```
K:kat  Katame-no-Kata   K:kim  Kime-no-Kata   K:its  Itsutsu-no-Kata
C:HAJ  Hajime   C:MAT  Matte   C:YAM  Yame
C:WAZ  Waza-ari (½)   C:IPP  Ippon (1)   C:FUS  Fusen-gachi
P:SZ   Seiryoku-Zenyo   P:JK  Jita-Kyoei   P:MX  "Do your best and await the result"
```

### Outcome glyphs
```
!     ippon awarded             ½     waza-ari awarded
~     technique attempted, no score    x     reversed / countered
#     match-ending event        ?     under review
```

### Line grammar
```
<match_id>.<round>.<seq>  <clock>  <tori>→<uke>  <code><outcome>  [C:<ref_cmd>]  [note]
```

### Worked example
```
M042.R1.001  00:07  Shiro→Aka   C:HAJ
M042.R1.002  00:22  Shiro→Aka   Nto~
M042.R1.003  00:41  Aka→Shiro   Nosm½        C:MAT
M042.R1.004  01:03  Shiro→Aka   C:HAJ
M042.R1.005  01:18  Shiro→Aka   Go:ksg½      # waza-ari + waza-ari = ippon
M042.R1.006  01:18  —            C:IPP#       winner=Shiro  P:SZ
```
Every token resolves to a canonical entry in the Section 1 JSON — the two-layer invariant.

### On-chain anchoring shape (granule commit)
```
leaf       = sha256(match_id || round || seq || clock || tori || uke || code || outcome)
round_root = merkle(leafs[])
match_root = merkle(round_roots[])
```
The `match_root` is what gets anchored. Raw lines stay off-chain; hashes prove
the sequence was not altered after the fact.

---

## Section 3 — Integration Outline: On-Chain Rank Verification & Residency

### 3.1 Three linked registries
```
┌─ Technique Registry ──┐   ┌─ Match Registry ──────┐   ┌─ Rank Registry ───────┐
│ Section-1 JSON, hash- │──▶│ Granule lines per     │──▶│ Kyū/Dan assertions,   │
│ anchored as canon     │   │ Section-2 notation,   │   │ each backed by cited  │
│ vocabulary root       │   │ match_root anchored   │   │ match_root + leaves   │
└───────────────────────┘   └───────────────────────┘   └───────────────────────┘
```
- **Canon root** = merkle over the Section 1 JSON. A notation symbol is only
  valid if its referent has an inclusion proof against the current canon root.
- **Match root** = per Section 2. Immutable once anchored.
- **Rank root** = per-judoka accumulator over cited match leaves, kata
  completions, and sensei attestations.

### 3.2 On-chain rank verification (the half-tally)
Rank is asserted off-chain (name, grade, issuing dojo) but **satisfied** the
same way a split-tally bond satisfies — both halves must match:
- **Student half**: signed rank claim + pointer set `{match_root : leaf_index}*`
- **Kodokan / dojo half**: counter-signature committing to the same pointer set
- A verifier walks each pointer → recomputes leaf → checks inclusion in the
  anchored match_root → confirms the grain lines up. No claim, no anchor, no rank.

Promotion rules become pure predicates over the Match Registry:
```
promote(judoka, target_rank) ⇐
  count(match_leaves where tori=judoka ∧ outcome ∈ {!, #}) ≥ threshold(target_rank)
  ∧ kata_completions(judoka) ⊇ required_kata(target_rank)
  ∧ sensei_attestation(judoka, target_rank).valid
```

### 3.3 Referee / scorekeeper role
Scorekeeper is the **notary at the mat**: emits Section-2 lines live, each
signed with their key; at `C:IPP#` or time expiry the match_root is computed
and broadcast. Referee disputes are themselves granules (`C:?` under review)
so the audit trail is a complete state machine, not an edited document.

### 3.4 Residency program integration
The residency is the **human grain** beside the digital grain.
- Residents carry a key tied to their Rank Registry entry.
- Every mat session emits match_root anchors; residency progress is literally
  the append-only diff on the resident's rank accumulator.
- Philosophy tokens (`P:SZ`, `P:JK`, `P:MX`) are not cosmetic — they are the
  required closing granule on certain rank-advancing matches and kata
  demonstrations, forcing the discourse layer into the on-chain record.
- Cross-dojo residency exchange: because canon root and notation are shared,
  a resident who trains at another dojo accrues leaves under the same schema;
  no re-translation, no re-certification theater.

### 3.5 Boundary against Metalaw (no crossover)
Metalaw v0.2 is locked and untouched. Kodokan Digital Dojo mirrors its
**pattern** only: two-layer symbol/discourse discipline, granule-level
anchoring, and split-tally satisfaction semantics. The two projects share
**no files, no vocabulary, no master model** — fraternal twins, not siblings
in one schema.

### 3.6 v0.1 → v0.2 roadmap (stubbed, not scheduled)
1. Complete the truncated technique list by re-reading the full menu source.
2. Expand `kansetsu_waza` and close every `"etc."` terminator with verified
   entries.
3. Define sensei attestation signature format.
4. Draft `threshold(target_rank)` and `required_kata(target_rank)` tables from
   Kodokan promotion standards (source pending).
5. Test vector: one full shiai scored end-to-end in Section-2 notation with
   a recomputed match_root.

---

## Section 4 — Sensei Attestation Signature Format

### 4.1 Purpose
A sensei attestation is the dojo-side half of the split-tally for a rank
claim. It cryptographically witnesses that, at a specific moment, a judoka
completed a defined set of matches and kata that satisfy the promotion
predicate for a named target rank. It does not itself create rank — it
only provides the verifiable dojo counter-signature.

### 4.2 Canonical Payload (CBOR-serialized)
```cbor
{
  "v": 1,                          // schema version
  "subject": h'<32-byte judoka Ed25519 pubkey>',
  "target": "shodan" | "nidan" | ... | "rokkyu",
  "canon_root": h'<32-byte SHA-256 of active Section-1 canon>',
  "citations": [                   // match citations
    {
      "match_root": h'<32-byte>',
      "leaf_index": <uint32>
    },
    ...
  ],
  "kata_cites": [                  // kata citations
    {
      "kata": "Katame-no-Kata",
      "match_root": h'<32-byte>',
      "leaf_index": <uint32>
    },
    ...
  ],
  "issued_at": <unix_timestamp_seconds>,
  "dojo_id": "kodokan-tokyo-01",   // human-readable label
  "sensei": h'<32-byte sensei Ed25519 pubkey>'
}
```

### 4.3 Signature
```
sig = Ed25519.sign(sensei_privkey, sha256(cbor(payload)))
attestation = { payload, sig }
```
Ed25519 chosen for 64-byte signatures, deterministic output, and fit with
existing on-chain anchor tooling.

### 4.4 Verification predicate
```
valid(attestation) ⇐
   Ed25519.verify(payload.sensei, sig, sha256(cbor(payload)))
 ∧ payload.canon_root ∈ anchored_canon_roots
 ∧ ∀ cite ∈ payload.citations  : inclusion_proof(cite.leaf_index, cite.match_root)
 ∧ ∀ kc   ∈ payload.kata_cites : inclusion_proof(kc.leaf_index,   kc.match_root)
 ∧ promote(payload.subject, payload.target)   // predicate from §3.2
```
A verifier needs only: the attestation, the cited match_roots (public anchors),
and the current canon root. No dojo-internal data required.

### 4.5 Revocation
Attestations are **not mutable**. A withdrawal is a new, countersigned
`revocation` record citing the original attestation's hash:
```
revocation = { prior: sha256(cbor(attestation)), reason_code, sensei_sig, board_sig }
```
Revocations append; the audit trail remains complete.

---

## Section 5 — End-to-End Shiai Test Vector

Only techniques verbatim from Section 1 JSON are used. Real SHA-256 computed.

### 5.1 Match script (Section-2 notation)
```
M100.R1.001  00:08  Shiro→Aka   Nto~
M100.R1.002  00:35  Shiro→Aka   Nis½
M100.R2.001  01:12  Aka→Shiro   Nosm~
M100.R2.002  01:48  Shiro→Aka   Go:ksg!#   winner=Shiro
```

### 5.2 Encoding spec (pinned for this vector)
```
preimage   = UTF-8( match_id | round | seq | clock | tori | uke | code | outcome )
leaf       = SHA-256(preimage)                  -- 32 bytes
round_root = SHA-256( leaf_1 ∥ leaf_2 )         -- raw bytes concatenated
match_root = SHA-256( round_root_R1 ∥ round_root_R2 )
```
Separator is the ASCII pipe `|` (0x7C). No trailing newline.

### 5.3 Computed vector
```
preimages:
  M100|R1|001|00:08|Shiro|Aka|Nto|~
  M100|R1|002|00:35|Shiro|Aka|Nis|½
  M100|R2|001|01:12|Aka|Shiro|Nosm|~
  M100|R2|002|01:48|Shiro|Aka|Go:ksg|!#

leaves:
  leaf_1 : 29836fad388b29a5d909e59c5e32c311c84dbdf9974eb49fd8c563a9d55457b8
  leaf_2 : 6ec7e7deae79706ce331725e29e878db136ee90e8135e11dd45b63e4859ae405
  leaf_3 : 4efeb6281e2e6d6178fdf998ef78c3dfd382bfc1a543f7f9a75edd7273b0874d
  leaf_4 : 9b99e6fe1529dc917f7f7a52599c36afdb00f076b28f61a7e78637a0f03164ee

round_root_R1 : c9cbd34046a95aa2e52361068f471fc0d87022d6c2a9ca1912dd1e74cee4f97b
round_root_R2 : 53891643beebf1eba5961ab5413f60542776d352666502b1e69c6c86471f40c7
match_root    : dd6ec0cb84e5f2b96630e972c1b8e523d3faea324b2194f20fcf578ea6c77d54
```

### 5.4 What this demonstrates
- Every notation token (`Nto`, `Nis`, `Nosm`, `Go:ksg`) resolves to a verbatim
  Section-1 entry (Tai-otoshi, Ippon-seoinage, O-soto-makikomi, Kami-shiho-gatame).
- Any tampering with any field of any line changes a leaf, which changes a
  round_root, which changes the match_root — split-tally grain behaviour.
- `match_root dd6ec0cb…7d54` is the single value an anchoring transaction
  commits to. Raw lines stay off-chain.

### 5.5 Still deferred (requires source I don't have)
- Full technique list beyond the `etc.` markers.
- Closing the truncation at `kansetsu_waza`.
- `threshold(target_rank)` and `required_kata(target_rank)` values grounded
  in Kodokan promotion standards.
Any of these needs the remainder of the menu source — not willing to fabricate.

---

## Section 6 — Current State + Minimal Placeholder Scaffolding

### 6.1 What is solid (no fabrication)
- **Section 1** — Verbatim JSON extraction from the source menu; truncation
  at `kansetsu_waza` flagged; `etc.` markers preserved.
- **Section 2** — Compact notation (category prefixes, technique codes,
  outcome glyphs, line grammar, merkle anchoring shape). Every symbol
  resolves to a Section-1 entry.
- **Section 3** — Three-registry architecture (Technique / Match / Rank),
  half-tally verification, scorekeeper-as-notary, residency integration.
- **Section 4** — Sensei attestation CBOR payload, Ed25519 signing,
  verification predicate, append-only revocation.
- **Section 5** — End-to-end shiai test vector with real SHA-256 leaves,
  round_roots, and `match_root = dd6ec0cb…7d54`.

### 6.2 Placeholder for Section 1 — "Core Verifiable Subset"
Additive scaffolding. The verbatim Section-1 JSON remains pristine; this
subset lives alongside it so v0.1 is compilable without fabricating the
full menu. Entries below are either already present in Section 1 or are
foundational Gokyo no Waza throws explicitly named in the request.

```
CORE VERIFIABLE SUBSET (placeholder; authoritative Kodokan menu import pending)

Nagewaza — already verbatim in Section 1:
  Nto    Tai-otoshi
  Nis    Ippon-seoinage
  Nosm   O-soto-makikomi

Nagewaza — added as foundational placeholder:
  Ndah   De-ashi-harai          (advancing-foot sweep)
  Nog    O-goshi                (major hip throw)
  Nosg   O-soto-gari            (major outer reap)
  Nsn    Seoi-nage              (shoulder throw)

Osaekomi — already verbatim in Section 1:
  Go:ksg  Kami-shiho-gatame
```
Marker: **"Official full Kodokan menu to be imported from authoritative
source when available."** Canon root will bump on import; attestations
bind to the canon_root at signing time, so pre-import attestations remain
verifiable under the v0.1 canon.

### 6.3 Placeholder for Section 3 — Extensible Promotion Predicate
Structure only. Exact thresholds deferred to authoritative source.
```
promote(subject, target_rank) ⇐
    count_matches(subject, outcome ∈ {!, #})
        ≥ threshold_matches(target_rank)
  ∧ kata_completions(subject) ⊇ required_kata(target_rank)
  ∧ time_in_grade(subject, current_rank(subject))
        ≥ min_time(target_rank)
  ∧ sensei_attestation(subject, target_rank).valid

-- Tables to be populated from authoritative source:
threshold_matches : RANK → N           -- TBD (e.g. from Kodokan/USJF)
required_kata     : RANK → Set<Kata>   -- TBD
min_time          : RANK → Duration    -- TBD
```
The predicate is pure and composable: once the three tables land, the
predicate need not change — only the tables.

---

## Section 7 — Next Concrete Steps to Unblock Full v0.1

### 7.1 Suggested canonical sources
- **Kodokan Institute** — official technique nomenclature and promotion
  standards (same body that issued the source menu).
- **"Kodokan Judo"** by Jigoro Kano, revised editions — standard reference
  covering waza and kata names.
- **IJF** — international technique naming, useful for cross-dojo parity.
- **USJF / USA Judo** — published kyū/dan promotion requirements in a
  format close to what `threshold_matches` / `required_kata` / `min_time`
  expect.

All of the above must be cited at import time; the citation itself becomes
part of the canon_root preimage so the provenance of the menu is auditable.

### 7.2 How the notation system should scale
- **Prefix namespace is already partitioned** (`N`, `Go`, `Gs`, `Gk`, `K`,
  `C`, `P`) — adding techniques never touches command or philosophy space.
- **Code-length rule**: 3-char technique codes are preferred; on collision,
  extend to 4 chars (e.g., `Nosg` / `Nosm`). Codes are never recycled once
  anchored under a canon_root.
- **Canon versioning**: each menu import produces a new `canon_root`.
  Attestations carry the canon_root they were signed against, so
  historical matches stay verifiable even as the menu grows.
- **Backward compatibility**: new techniques append; existing match_roots
  are untouched. A residency transcript built under canon v0.1 remains
  valid under canon v1.0.

### 7.3 Validation plan before finalizing v0.1
1. **Replay the Section-5 test vector** after any canon update to confirm
   that leaves, round_roots, and match_root are unchanged — the grain
   must still match.
2. **Code uniqueness lint**: run a pass over the full imported menu to
   confirm no two techniques share a code; collisions get the 4-char
   extension deterministically.
3. **Pilot under a single dojo**: one residency cohort runs the full
   scorekeeper → attestation → rank-assertion cycle end-to-end before the
   protocol is offered to a second dojo. Cross-dojo exchange (§3.4) is
   gated on a clean pilot.
4. **Independent verification**: an auditor reconstructs one promotion
   from only the public anchors and the attestation — if they can't, the
   split-tally property is broken and v0.1 does not ship.


