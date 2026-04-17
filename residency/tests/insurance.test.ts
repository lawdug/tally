import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { insuranceLoader } from "../insurance";

describe("InsuranceCanonLoader", () => {
  it("loads + validates the shipped canon", () => {
    const canon = insuranceLoader.loadValidated();
    assert.equal(canon.version, "0.1");
    assert.ok(canon.policy_types.length >= 4);
    assert.ok(canon.coverage_scopes.length >= 4);
    assert.ok(canon.claim_categories.length >= 4);
    assert.ok(canon.term_lengths.length >= 2);
  });

  it("starter notes block is present and well-formed", () => {
    const canon = insuranceLoader.load();
    assert.ok(canon.notes, "expected notes block on starter canon");
    assert.match(canon.notes!.status, /starter/i);
  });

  it("ref surfaces the expected identity", () => {
    const ref = insuranceLoader.ref(insuranceLoader.load());
    assert.equal(ref.name, "residency.insurance");
    assert.equal(ref.version, "0.1");
    assert.match(ref.canon_root, /^[0-9a-f]{64}$/);
  });

  it("validate rejects missing required arrays", () => {
    const res = insuranceLoader.validate({
      version: "0.1",
      issued_at: 1,
      policy_types: [],
      coverage_scopes: [],
      claim_categories: [],
      term_lengths: [],
      attestation_types: {},
    });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes("policy_types")));
    assert.ok(res.errors.some((e) => e.includes("term_lengths")));
    assert.ok(res.errors.some((e) => e.includes("attestation_types")));
  });

  it("validate rejects malformed notes", () => {
    const res = insuranceLoader.validate({
      version: "0.1",
      issued_at: 1,
      policy_types: ["health"],
      coverage_scopes: ["primary_resident"],
      claim_categories: ["medical"],
      term_lengths: ["annual"],
      attestation_types: { x: "y" },
      notes: { status: "" },
    });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes("notes.status")));
  });
});
