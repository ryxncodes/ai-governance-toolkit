"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import { RiskBadge } from "@/components/reviews/risk-badge"
import { Button } from "@/components/ui/button"
import {
  runSafetyTesterAction,
  type SafetyTesterState,
} from "@/app/safety-tester/actions"

const fieldClassName =
  "min-h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      Run safety test
    </Button>
  )
}

export function SafetyTesterForm() {
  const initialState: SafetyTesterState = { response: "" }
  const [state, formAction] = useActionState(runSafetyTesterAction, initialState)

  return (
    <div className="grid gap-6">
      <form action={formAction} className="grid gap-4">
        {state.error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {state.error}
          </div>
        ) : null}
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Chatbot response</span>
          <textarea
            className={`${fieldClassName} min-h-64 resize-y`}
            name="response"
            defaultValue={state.response}
            placeholder="Paste a response from an internal chatbot or RAG app."
          />
        </label>
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>

      {state.report ? (
        <div className="grid gap-5 rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <RiskBadge level={state.report.riskLevel} />
            <p className="text-sm text-muted-foreground">
              {state.report.failedChecks.length} failed check(s)
            </p>
          </div>

          <div className="grid gap-2">
            {state.report.checks.map((check) => (
              <div key={check.id} className="grid gap-1 rounded-lg bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{check.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {check.passed ? "Pass" : "Fail"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{check.finding}</p>
                {!check.passed ? (
                  <p className="text-sm text-muted-foreground">
                    Mitigation: {check.mitigation}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <section className="grid gap-2">
            <h2 className="font-medium">Regression prompts</h2>
            <ul className="grid gap-1 text-sm text-muted-foreground">
              {state.report.regressionPrompts.map((prompt) => (
                <li key={prompt}>- {prompt}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  )
}
