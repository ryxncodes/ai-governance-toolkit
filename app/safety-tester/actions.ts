"use server"

import { runSafetyTest, type SafetyTestReport } from "@/lib/safety/tester"

export type SafetyTesterState = {
  response: string
  report?: SafetyTestReport
  error?: string
}

export async function runSafetyTesterAction(
  _previousState: SafetyTesterState,
  formData: FormData
): Promise<SafetyTesterState> {
  const response = String(formData.get("response") ?? "").trim()

  if (response.length < 40) {
    return {
      response,
      error: "Paste a chatbot or RAG response long enough to evaluate.",
    }
  }

  return {
    response,
    report: runSafetyTest(response),
  }
}
