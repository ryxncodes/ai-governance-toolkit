import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { can, permissionsForRole, roleLabel } from "@/lib/auth/permissions"

describe("role permissions", () => {
  it("allows owners to manage the workspace", () => {
    assert.equal(can("OWNER", "workspace:manage"), true)
    assert.equal(can("OWNER", "tool:create"), true)
    assert.equal(can("OWNER", "review:update"), true)
  })

  it("keeps reviewers focused on review work", () => {
    assert.equal(can("REVIEWER", "review:update"), true)
    assert.equal(can("REVIEWER", "tool:create"), false)
    assert.equal(can("REVIEWER", "workspace:manage"), false)
  })

  it("limits viewers to employee-facing guidance", () => {
    assert.deepEqual(permissionsForRole("VIEWER"), ["approved:view"])
    assert.equal(roleLabel("VIEWER"), "Viewer")
  })
})
