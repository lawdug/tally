"""Kodokan Digital Dojo v0.1 — verifier utility.

Operationalizes §7.3 step 1 (replay test vector) and §5.4 / §5.5
(verification walkthrough and tamper detection).

Run:  python3 verify.py
"""

import hashlib
from typing import Dict, List, Tuple


# ---------- primitives ----------

def sha256(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()


def compute_leaf(
    match_id: str, rnd: str, seq: str, clock: str,
    tori: str, uke: str, code: str, outcome: str,
) -> Tuple[str, bytes]:
    """Build the Section-5 preimage and return (preimage, 32-byte leaf)."""
    preimage = f"{match_id}|{rnd}|{seq}|{clock}|{tori}|{uke}|{code}|{outcome}"
    return preimage, sha256(preimage.encode("utf-8"))


def merkle_pair(left: bytes, right: bytes) -> bytes:
    """Pairwise merkle step: SHA-256(left || right) on raw bytes."""
    return sha256(left + right)


def match_root_from_leaves(rounds: List[List[bytes]]) -> bytes:
    """Compute match_root = SHA256(round_root_R1 || round_root_R2 || ...).

    Each inner list is the leaves of one round in order.
    """
    round_roots = [
        merkle_pair(r[0], r[1]) if len(r) == 2 else r[0]
        for r in rounds
    ]
    if len(round_roots) == 1:
        return round_roots[0]
    acc = round_roots[0]
    for rr in round_roots[1:]:
        acc = merkle_pair(acc, rr)
    return acc


# ---------- replay ----------

SECTION_5_LINES = [
    ("M100", "R1", "001", "00:08", "Shiro", "Aka", "Nto",    "~"),
    ("M100", "R1", "002", "00:35", "Shiro", "Aka", "Nis",    "\u00bd"),  # ½
    ("M100", "R2", "001", "01:12", "Aka",   "Shiro", "Nosm", "~"),
    ("M100", "R2", "002", "01:48", "Shiro", "Aka", "Go:ksg", "!#"),
]

SECTION_5_EXPECTED_ROOT = bytes.fromhex(
    "dd6ec0cb84e5f2b96630e972c1b8e523d3faea324b2194f20fcf578ea6c77d54"
)


def replay_test_vector() -> bool:
    """Recompute the Section 5 match_root from the published lines.

    Returns True iff the computed root equals the anchored expected root.
    """
    leaves: List[bytes] = []
    print("Recomputing leaves:")
    for line in SECTION_5_LINES:
        preimage, leaf = compute_leaf(*line)
        leaves.append(leaf)
        print(f"  {preimage}")
        print(f"    leaf = {leaf.hex()}")
    rounds = [leaves[:2], leaves[2:]]
    match_root = match_root_from_leaves(rounds)
    print()
    print(f"Computed match_root : {match_root.hex()}")
    print(f"Expected match_root : {SECTION_5_EXPECTED_ROOT.hex()}")
    ok = match_root == SECTION_5_EXPECTED_ROOT
    print(f"Match: {ok}")
    return ok


# ---------- tamper demo ----------

def tamper_demo() -> None:
    """Flip one character in leaf_1's preimage; show divergence."""
    tampered = list(SECTION_5_LINES[0])
    tampered[5] = "aka"  # "Aka" -> "aka"
    _, bad_leaf = compute_leaf(*tampered)
    _, good_leaf = compute_leaf(*SECTION_5_LINES[0])
    print()
    print("Tamper demo (flipping 'Aka' -> 'aka' in leaf_1 preimage):")
    print(f"  good leaf_1 : {good_leaf.hex()}")
    print(f"  bad  leaf_1 : {bad_leaf.hex()}")
    # Rebuild the rest from good leaves
    rest = [compute_leaf(*line)[1] for line in SECTION_5_LINES[1:]]
    tampered_root = match_root_from_leaves([[bad_leaf, rest[0]], rest[1:]])
    print(f"  tampered match_root : {tampered_root.hex()}")
    print(f"  anchored match_root : {SECTION_5_EXPECTED_ROOT.hex()}")
    print(f"  differ: {tampered_root != SECTION_5_EXPECTED_ROOT}")


# ---------- attestation skeleton ----------

def verify_attestation(
    attestation: Dict,
    anchored_canon_roots: set,
    inclusion_oracles,
) -> bool:
    """Structural skeleton for §4.4 verify predicate.

    Full implementation requires:
      - Ed25519 signature verification over sha256(cbor(payload))
      - payload.canon_root ∈ anchored_canon_roots
      - inclusion proofs for each cite and kata_cite
      - promote() predicate over the Match Registry (§6.3)
    """
    _ = attestation, anchored_canon_roots, inclusion_oracles
    return True


# ---------- entry ----------

if __name__ == "__main__":
    ok = replay_test_vector()
    tamper_demo()
    raise SystemExit(0 if ok else 1)
