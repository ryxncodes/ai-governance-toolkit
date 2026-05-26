import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { parseToolFormData } from "@/lib/tools/form"

describe("tool form parsing", () => {
  it("trims required fields and keeps valid allowed data types", () => {
    const formData = new FormData()
    formData.set("name", "  ChatGPT  ")
    formData.set("vendor", "  OpenAI ")
    formData.set("category", " Assistant ")
    formData.set("status", "APPROVED")
    formData.append("allowedDataTypes", "PUBLIC")
    formData.append("allowedDataTypes", "CUSTOMER")
    formData.append("allowedDataTypes", "NOT_A_REAL_TYPE")

    const state = parseToolFormData(formData)

    assert.equal(state.values.name, "ChatGPT")
    assert.equal(state.values.vendor, "OpenAI")
    assert.equal(state.values.category, "Assistant")
    assert.deepEqual(state.values.allowedDataTypes, ["PUBLIC", "CUSTOMER"])
    assert.deepEqual(state.errors, {})
  })

  it("returns field errors for missing required values", () => {
    const state = parseToolFormData(new FormData())

    assert.equal(state.errors.name, "Tool name is required.")
    assert.equal(state.errors.vendor, "Vendor is required.")
    assert.equal(state.errors.category, "Category is required.")
  })
})
