import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  canonRoot,
  hashLeaf,
  merkleRoot,
  sha256Hex,
  canonicalize,
} from "../shared";

function sha(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function concatHash(a: string, b: string): string {
  return createHash("sha256")
    .update(Buffer.concat([Buffer.from(a, "hex"), Buffer.from(b, "hex")]))
    .digest("hex");
}

describe("sha256Hex", () => {
  it("matches node:crypto on an empty string", () => {
    assert.equal(sha256Hex(""), sha(""));
  });
  it("matches node:crypto on known input", () => {
    assert.equal(sha256Hex("abc"), sha("abc"));
  });
});

describe("hashLeaf", () => {
  it("canonicalises the leaf before hashing", () => {
    const a = hashLeaf({ a: 1, b: 2 });
    const b = hashLeaf({ b: 2, a: 1 });
    assert.equal(a, b);
    assert.equal(a, sha(canonicalize({ a: 1, b: 2 })));
  });
});

describe("merkleRoot", () => {
  it("empty tree hashes to SHA-256 of empty string", () => {
    assert.equal(merkleRoot([]), sha(""));
  });

  it("single leaf reduces to hashLeaf", () => {
    assert.equal(merkleRoot(["x"]), hashLeaf("x"));
  });

  it("two leaves combine in order", () => {
    const a = hashLeaf("a");
    const b = hashLeaf("b");
    assert.equal(merkleRoot(["a", "b"]), concatHash(a, b));
  });

  it("odd level duplicates the trailing node (Bitcoin convention)", () => {
    const a = hashLeaf("a");
    const b = hashLeaf("b");
    const c = hashLeaf("c");
    // level 1: H(a|b), H(c|c)
    const ab = concatHash(a, b);
    const cc = concatHash(c, c);
    // level 2: H(ab|cc)
    const expected = concatHash(ab, cc);
    assert.equal(merkleRoot(["a", "b", "c"]), expected);
  });

  it("leaf order is significant", () => {
    assert.notEqual(merkleRoot(["a", "b"]), merkleRoot(["b", "a"]));
  });

  it("is stable across object-key reorderings at the leaf level", () => {
    const x = merkleRoot([{ a: 1, b: 2 }, { c: 3 }]);
    const y = merkleRoot([{ b: 2, a: 1 }, { c: 3 }]);
    assert.equal(x, y);
  });
});

describe("canonRoot", () => {
  it("matches SHA-256 of canonicalize(canon)", () => {
    const canon = { b: 2, a: 1 };
    assert.equal(canonRoot(canon), sha(canonicalize(canon)));
  });
});
