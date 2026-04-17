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


