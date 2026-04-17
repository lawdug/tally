import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { coreLoader } from "../core";
import { propertyLoader } from "../property";
import { canonRoot, merkleRoot, hashLeaf } from "../shared";

/**
 * Cross-pillar integration sanity: shared primitives produce identical
 * digests for the same input regardless of which pillar computed them.
 * This is the property that makes split-tally verification work.
 */
describe("core + property integration", () => {
  it("both pillars compute the same canon_root for shared data", () => {
    const shared = {
      version: "x",
      issued_at: 0,
      payload: { hello: "world", n: 42 },
    };
    const viaCore = coreLoader.canonRoot(shared as never);
    const viaProperty = propertyLoader.canonRoot(shared as never);
    const standalone = canonRoot(shared);
    assert.equal(viaCore, viaProperty);
    assert.equal(viaCore, standalone);
  });

  it("both pillars agree on a Merkle root over shared leaves", () => {
    const leaves = [
      { claim_id: "A-1", status: "submitted" },
      { claim_id: "A-2", status: "approved" },
      { claim_id: "A-3", status: "paid" },
    ];
    // Property has no dedicated Merkle method — it uses the shared helper,
    // which is exactly the point of the shared layer.
    const root = merkleRoot(leaves);
    // Order matters: reversing changes the root.
    assert.notEqual(root, merkleRoot(leaves.slice().reverse()));
    // Canonical key reorder at the leaf level must not change the root.
    const reordered = leaves.map((l) => ({ status: l.status, claim_id: l.claim_id }));
    assert.equal(merkleRoot(reordered), root);
  });

  it("a property canon_root is independent of core canon_root (roots differ)", () => {
    const coreRoot = coreLoader.canonRoot(coreLoader.load());
    const propRoot = propertyLoader.canonRoot(propertyLoader.load());
    assert.notEqual(coreRoot, propRoot);
  });

  it("hashLeaf is stable for the core and property refs", () => {
    const coreRef = coreLoader.ref(coreLoader.load());
    const propRef = propertyLoader.ref(propertyLoader.load());
    const h1 = hashLeaf(coreRef);
    const h2 = hashLeaf({ ...coreRef });
    assert.equal(h1, h2);
    assert.notEqual(hashLeaf(coreRef), hashLeaf(propRef));
  });

  it("a pillar's CanonRef round-trips via merkleRoot", () => {
    const refs = [
      coreLoader.ref(coreLoader.load()),
      propertyLoader.ref(propertyLoader.load()),
    ];
    const root = merkleRoot(refs);
    assert.match(root, /^[0-9a-f]{64}$/);
  });
});
