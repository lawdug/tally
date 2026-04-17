import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isNonEmptyString,
  isNonEmptyStringArray,
  isFiniteNumber,
  isPlainObject,
  validateCanonMeta,
  validateStringMap,
  fromErrors,
} from "../shared";

describe("type guards", () => {
  it("isNonEmptyString", () => {
    assert.equal(isNonEmptyString("a"), true);
    assert.equal(isNonEmptyString(""), false);
    assert.equal(isNonEmptyString(123 as unknown), false);
  });
  it("isNonEmptyStringArray", () => {
    assert.equal(isNonEmptyStringArray(["a"]), true);
    assert.equal(isNonEmptyStringArray([]), false);
    assert.equal(isNonEmptyStringArray(["a", ""]), false);
    assert.equal(isNonEmptyStringArray(["a", 1 as unknown]), false);
  });
  it("isFiniteNumber", () => {
    assert.equal(isFiniteNumber(0), true);
    assert.equal(isFiniteNumber(NaN), false);
    assert.equal(isFiniteNumber(Infinity), false);
  });
  it("isPlainObject", () => {
    assert.equal(isPlainObject({}), true);
    assert.equal(isPlainObject([]), false);
    assert.equal(isPlainObject(null), false);
    assert.equal(isPlainObject("x" as unknown), false);
  });
});

describe("validateCanonMeta", () => {
  it("accepts a valid meta", () => {
    assert.deepEqual(
      validateCanonMeta({ version: "0.1", issued_at: 1 }),
      []
    );
  });
  it("flags missing version", () => {
    const errs = validateCanonMeta({ issued_at: 1 });
    assert.ok(errs.some((e) => e.includes("version")));
  });
  it("flags missing issued_at", () => {
    const errs = validateCanonMeta({ version: "0.1" });
    assert.ok(errs.some((e) => e.includes("issued_at")));
  });
  it("flags non-object input", () => {
    assert.deepEqual(validateCanonMeta(null), ["canon must be an object"]);
  });
});

describe("validateStringMap", () => {
  it("accepts a non-empty map of string values", () => {
    assert.deepEqual(
      validateStringMap({ a: "1", b: "2" }, "types"),
      []
    );
  });
  it("rejects an empty map unless allowEmpty", () => {
    assert.deepEqual(validateStringMap({}, "types"), [
      "types must not be empty",
    ]);
    assert.deepEqual(validateStringMap({}, "types", { allowEmpty: true }), []);
  });
  it("reports per-key errors", () => {
    const errs = validateStringMap({ a: "", b: 1 as unknown }, "types");
    assert.ok(errs.some((e) => e.includes("types.a")));
    assert.ok(errs.some((e) => e.includes("types.b")));
  });
  it("rejects non-object input", () => {
    assert.deepEqual(validateStringMap([] as unknown, "types"), [
      "types must be an object",
    ]);
  });
});

describe("fromErrors", () => {
  it("valid when empty", () => {
    assert.deepEqual(fromErrors([]), { valid: true, errors: [] });
  });
  it("invalid otherwise", () => {
    assert.deepEqual(fromErrors(["e"]), { valid: false, errors: ["e"] });
  });
});
