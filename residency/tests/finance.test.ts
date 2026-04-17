import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { financeLoader } from "../finance";

describe("FinanceCanonLoader", () => {
  it("loads + validates the shipped canon", () => {
    const canon = financeLoader.loadValidated();
    assert.equal(canon.version, "0.1");
    assert.ok(canon.instrument_types.length >= 4);
    assert.ok(canon.fund_sources.length >= 4);
    assert.ok(canon.currency_rails.length >= 2);
    assert.ok(canon.flow_directions.length >= 2);
  });

  it("starter notes block is present and well-formed", () => {
    const canon = financeLoader.load();
    assert.ok(canon.notes, "expected notes block on starter canon");
    assert.match(canon.notes!.status, /starter/i);
  });

  it("ref surfaces the expected identity", () => {
    const ref = financeLoader.ref(financeLoader.load());
    assert.equal(ref.name, "residency.finance");
    assert.equal(ref.version, "0.1");
    assert.match(ref.canon_root, /^[0-9a-f]{64}$/);
  });

  it("validate rejects missing required arrays", () => {
    const res = financeLoader.validate({
      version: "0.1",
      issued_at: 1,
      instrument_types: [],
      fund_sources: [],
      currency_rails: [],
      flow_directions: [],
      attestation_types: {},
    });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes("instrument_types")));
    assert.ok(res.errors.some((e) => e.includes("fund_sources")));
    assert.ok(res.errors.some((e) => e.includes("attestation_types")));
  });

  it("validate rejects malformed notes", () => {
    const res = financeLoader.validate({
      version: "0.1",
      issued_at: 1,
      instrument_types: ["grant"],
      fund_sources: ["personal"],
      currency_rails: ["jpy_domestic"],
      flow_directions: ["inbound"],
      attestation_types: { x: "y" },
      notes: 42,
    });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes("notes")));
  });
});
