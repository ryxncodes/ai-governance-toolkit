"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import { auditPolicyAction, type PolicyFormState } from "@/app/policies/actions"
import { Button } from "@/components/ui/button"

const fieldClassName =
  "min-h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      Audit policy
    </Button>
  )
}

export function PolicyAuditForm() {
  const initialState: PolicyFormState = { title: "", content: "" }
  const [state, formAction] = useActionState(auditPolicyAction, initialState)

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {state.error}
        </div>
      ) : null}
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Policy title</span>
        <input
          className={fieldClassName}
          name="title"
          defaultValue={state.title}
          placeholder="AI Acceptable Use Policy"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Policy text</span>
        <textarea
          className={`${fieldClassName} min-h-64 resize-y`}
          name="content"
          defaultValue={state.content}
          placeholder="Paste an existing AI policy or draft policy text."
        />
      </label>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}
