import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { coreLoader } from "../core";
import { propertyLoader } from "../property";

describe("CoreCanonLoader", () => {
  it("loads + validates the shipped canon", () => {
    const canon = coreLoader.loadValidated();
    assert.equal(canon.version, "0.1");
    assert.ok(canon.entities.residency_types.length > 0);
  });

  it("canonRoot is deterministic", () => {
    const c = coreLoader.load();
    assert.equal(coreLoader.canonRoot(c), coreLoader.canonRoot(c));
  });

  it("ref surfaces name, version, and canon_root", () => {
    const ref = coreLoader.ref(coreLoader.load());
    assert.equal(ref.name, "residency.core");
    assert.equal(ref.version, "0.1");
    assert.match(ref.canon_root, /^[0-9a-f]{64}$/);
  });

  it("validate rejects malformed input", () => {
    const res = coreLoader.validate({ version: "0.1" });
    assert.equal(res.valid, false);
    assert.ok(res.errors.length > 0);
  });

  it("loadValidated throws on malformed input", () => {
    assert.throws(
      () => coreLoader.loadValidated("/dev/null"),
      /Unexpected end|JSON|validation/i
    );
  });
});

describe("PropertyCanonLoader", () => {
  it("loads + validates the shipped canon", () => {
    const canon = propertyLoader.loadValidated();
    assert.equal(canon.version, "0.1");
    assert.ok(canon.cultural_fit_tags.length >= 8);
    assert.ok(canon.lease_durations.length >= 4);
  });

  it("starter notes block is present and well-formed", () => {
    const canon = propertyLoader.load();
    assert.ok(canon.notes, "expected notes block on starter canon");
    assert.match(canon.notes!.status, /starter/i);
  });

  it("validate rejects missing required arrays", () => {
    const res = propertyLoader.validate({
      version: "0.1",
      issued_at: 1,
      property_types: [],
      tenancy_types: [],
      cultural_fit_tags: [],
      lease_durations: [],
      attestation_types: {},
    });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes("property_types")));
    assert.ok(res.errors.some((e) => e.includes("attestation_types")));
  });

  it("validate rejects malformed notes", () => {
    const res = propertyLoader.validate({
      version: "0.1",
      issued_at: 1,
      property_types: ["apartment"],
      tenancy_types: ["long_term"],
      cultural_fit_tags: ["quiet_study"],
      lease_durations: ["1_year"],
      attestation_types: { x: "y" },
      notes: "not an object",
    });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes("notes")));
  });
});
