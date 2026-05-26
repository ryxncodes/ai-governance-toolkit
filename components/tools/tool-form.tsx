"use client"

import type { ToolFormState, ToolFormValues } from "@/lib/tools/form"
import { useActionState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import {
  DATA_TYPE_LABELS,
  DATA_TYPE_OPTIONS,
  TOOL_STATUS_LABELS,
  TOOL_STATUS_OPTIONS,
} from "@/lib/constants"
import { Button, buttonVariants } from "@/components/ui/button"

type ToolFormProps = {
  action: (
    previousState: ToolFormState,
    formData: FormData
  ) => Promise<ToolFormState>
  initialState: ToolFormState
  cancelHref: string
  submitLabel: string
}

const fieldClassName =
  "min-h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20"

const labelClassName = "text-sm font-medium"
const helpClassName = "text-xs text-muted-foreground"
const errorClassName = "text-xs font-medium text-destructive"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {label}
    </Button>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className={errorClassName}>{message}</p>
}

function TextInput({
  label,
  name,
  value,
  error,
  type = "text",
  placeholder,
  required,
}: {
  label: string
  name: keyof ToolFormValues
  value: string
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="grid gap-1.5">
      <span className={labelClassName}>{label}</span>
      <input
        className={fieldClassName}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
      />
      <FieldError message={error} />
    </label>
  )
}

function TextArea({
  label,
  name,
  value,
  error,
  placeholder,
}: {
  label: string
  name: keyof ToolFormValues
  value: string
  error?: string
  placeholder?: string
}) {
  return (
    <label className="grid gap-1.5">
      <span className={labelClassName}>{label}</span>
      <textarea
        className={`${fieldClassName} min-h-28 resize-y`}
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
      />
      <FieldError message={error} />
    </label>
  )
}

export function ToolForm({
  action,
  initialState,
  cancelHref,
  submitLabel,
}: ToolFormProps) {
  const [state, formAction] = useActionState(action, initialState)
  const values = state.values

  return (
    <form action={formAction} className="grid gap-6">
      {state.errors.form ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {state.errors.form}
        </div>
      ) : null}

      <section className="grid gap-4 rounded-lg border border-border p-4">
        <div>
          <h2 className="font-medium">Tool overview</h2>
          <p className={helpClassName}>
            Basic registry details employees and reviewers will recognize.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Tool name"
            name="name"
            value={values.name}
            error={state.errors.name}
            placeholder="ChatGPT"
            required
          />
          <TextInput
            label="Vendor"
            name="vendor"
            value={values.vendor}
            error={state.errors.vendor}
            placeholder="OpenAI"
            required
          />
          <TextInput
            label="Website"
            name="website"
            value={values.website}
            error={state.errors.website}
            placeholder="https://example.com"
            type="url"
          />
          <TextInput
            label="Category"
            name="category"
            value={values.category}
            error={state.errors.category}
            placeholder="General AI assistant"
            required
          />
        </div>
        <label className="grid gap-1.5 md:max-w-sm">
          <span className={labelClassName}>Status</span>
          <select
            className={fieldClassName}
            name="status"
            defaultValue={values.status}
            aria-invalid={Boolean(state.errors.status)}
          >
            {TOOL_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {TOOL_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <FieldError message={state.errors.status} />
        </label>
        <TextArea
          label="Description"
          name="description"
          value={values.description}
          error={state.errors.description}
          placeholder="What the tool does and how the organization expects to use it."
        />
      </section>

      <section className="grid gap-4 rounded-lg border border-border p-4">
        <div>
          <h2 className="font-medium">Use conditions</h2>
          <p className={helpClassName}>
            Capture what employees may do, what they should avoid, and which
            data types are allowed.
          </p>
        </div>
        <TextArea
          label="Approved use cases"
          name="approvedUseCases"
          value={values.approvedUseCases}
          error={state.errors.approvedUseCases}
          placeholder="Summarizing public articles, drafting internal FAQs, brainstorming..."
        />
        <TextArea
          label="Blocked use cases"
          name="blockedUseCases"
          value={values.blockedUseCases}
          error={state.errors.blockedUseCases}
          placeholder="Submitting credentials, regulated data, unreleased financials..."
        />
        <fieldset className="grid gap-2">
          <legend className={labelClassName}>Allowed data types</legend>
          <div className="grid gap-2 md:grid-cols-2">
            {DATA_TYPE_OPTIONS.map((dataType) => (
              <label
                key={dataType}
                className="flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <input
                  className="size-4 accent-primary"
                  name="allowedDataTypes"
                  type="checkbox"
                  value={dataType}
                  defaultChecked={values.allowedDataTypes.includes(dataType)}
                />
                {DATA_TYPE_LABELS[dataType]}
              </label>
            ))}
          </div>
          <FieldError message={state.errors.allowedDataTypes} />
        </fieldset>
      </section>

      <section className="grid gap-4 rounded-lg border border-border p-4">
        <div>
          <h2 className="font-medium">Review metadata</h2>
          <p className={helpClassName}>
            Lightweight ownership and review cadence fields for the registry.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <TextInput
            label="Review owner"
            name="reviewOwner"
            value={values.reviewOwner}
            error={state.errors.reviewOwner}
            placeholder="IT owner"
          />
          <TextInput
            label="Review date"
            name="reviewDate"
            value={values.reviewDate}
            error={state.errors.reviewDate}
            type="date"
          />
          <TextInput
            label="Next review date"
            name="nextReviewDate"
            value={values.nextReviewDate}
            error={state.errors.nextReviewDate}
            type="date"
          />
        </div>
        <TextArea
          label="Notes"
          name="notes"
          value={values.notes}
          error={state.errors.notes}
          placeholder="Open questions, team-specific restrictions, procurement notes..."
        />
      </section>

      <div className="flex items-center justify-end gap-2">
        <Link
          href={cancelHref}
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  )
}
