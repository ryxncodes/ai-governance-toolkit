import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  employeeStatusSummary,
  isEmployeeVisibleStatus,
} from "@/lib/tools/employee-guidance"

describe("employee guidance helpers", () => {
  it("only exposes approved and restricted tools to employees", () => {
    assert.equal(isEmployeeVisibleStatus("APPROVED"), true)
    assert.equal(isEmployeeVisibleStatus("RESTRICTED"), true)
    assert.equal(isEmployeeVisibleStatus("UNDER_REVIEW"), false)
    assert.equal(isEmployeeVisibleStatus("BLOCKED"), false)
  })

  it("explains status semantics in employee-facing language", () => {
    assert.match(employeeStatusSummary("APPROVED"), /Approved/)
    assert.match(employeeStatusSummary("RESTRICTED"), /Restricted/)
    assert.match(employeeStatusSummary("UNDER_REVIEW"), /Not approved/)
    assert.match(employeeStatusSummary("BLOCKED"), /Blocked/)
  })
})
