import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canonicalize } from "../shared";

describe("canonicalize", () => {
  it("emits object keys in lexicographic order", () => {
    const a = canonicalize({ b: 1, a: 2 });
    const b = canonicalize({ a: 2, b: 1 });
    assert.equal(a, b);
    assert.equal(a, '{"a":2,"b":1}');
  });

  it("preserves array order", () => {
    assert.equal(canonicalize([3, 1, 2]), "[3,1,2]");
  });

  it("strips whitespace and handles nesting", () => {
    const out = canonicalize({
      x: { z: [1, { k: "v", j: null }], y: true },
    });
    assert.equal(out, '{"x":{"y":true,"z":[1,{"j":null,"k":"v"}]}}');
  });

  it("renders primitive scalars predictably", () => {
    assert.equal(canonicalize(null), "null");
    assert.equal(canonicalize(true), "true");
    assert.equal(canonicalize(false), "false");
    assert.equal(canonicalize(42), "42");
    assert.equal(canonicalize("hi"), '"hi"');
  });

  it("JSON-escapes strings", () => {
    assert.equal(canonicalize('a"b'), '"a\\"b"');
    assert.equal(canonicalize("a\nb"), '"a\\nb"');
  });

  it("rejects non-finite numbers", () => {
    assert.throws(() => canonicalize(NaN), /non-finite/);
    assert.throws(() => canonicalize(Infinity), /non-finite/);
  });

  it("rejects unsupported types", () => {
    assert.throws(() => canonicalize(undefined as unknown), /unsupported/);
    assert.throws(() => canonicalize((() => 0) as unknown), /unsupported/);
  });

  it("is stable across reorderings at every depth", () => {
    const a = { z: 1, a: { y: 2, b: [{ n: 1, m: 2 }] } };
    const b = { a: { b: [{ m: 2, n: 1 }], y: 2 }, z: 1 };
    assert.equal(canonicalize(a), canonicalize(b));
  });
});
