"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

type ExtractionFormState = {
  sourceName: string
  sourceText: string
  error?: string
}

type VendorExtractionFormProps = {
  action: (
    previousState: ExtractionFormState,
    formData: FormData
  ) => Promise<ExtractionFormState>
  initialState?: ExtractionFormState
}

const fieldClassName =
  "min-h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      Extract findings
    </Button>
  )
}

export function VendorExtractionForm({
  action,
  initialState = { sourceName: "", sourceText: "" },
}: VendorExtractionFormProps) {
  const [state, formAction] = useActionState(action, initialState)

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {state.error}
        </div>
      ) : null}
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Source name or URL</span>
        <input
          className={fieldClassName}
          name="sourceName"
          defaultValue={state.sourceName}
          placeholder="Vendor privacy page, security FAQ, DPA, terms page..."
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Vendor documentation text</span>
        <textarea
          className={`${fieldClassName} min-h-40 resize-y`}
          name="sourceText"
          defaultValue={state.sourceText}
          placeholder="Paste relevant vendor documentation here."
        />
      </label>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}
