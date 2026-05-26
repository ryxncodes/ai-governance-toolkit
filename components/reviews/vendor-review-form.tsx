"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import {
  BUSINESS_CRITICALITY_LABELS,
  BUSINESS_CRITICALITY_OPTIONS,
  CONTROL_STATUS_LABELS,
  CONTROL_STATUS_OPTIONS,
  USER_BASE_SIZE_LABELS,
  USER_BASE_SIZE_OPTIONS,
  type VendorReviewFormState,
  type VendorReviewFormValues,
} from "@/lib/reviews/form"

type VendorReviewFormProps = {
  action: (
    previousState: VendorReviewFormState,
    formData: FormData
  ) => Promise<VendorReviewFormState>
  initialState: VendorReviewFormState
}

const fieldClassName =
  "min-h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"
const labelClassName = "text-sm font-medium"
const helpClassName = "text-xs text-muted-foreground"

const controlFields: Array<{
  name: keyof Pick<
    VendorReviewFormValues,
    | "modelTraining"
    | "dataRetention"
    | "ssoSupport"
    | "auditLogs"
    | "adminControls"
    | "complianceClaims"
    | "deletionSupport"
    | "termsClarity"
    | "sensitiveDataHandling"
  >
  label: string
  help: string
}> = [
  {
    name: "modelTraining",
    label: "Vendor may train on submitted data",
    help: "Yes increases risk; Unknown keeps it under review.",
  },
  {
    name: "dataRetention",
    label: "Vendor retains prompts or outputs",
    help: "Yes or Unknown adds operational risk.",
  },
  {
    name: "ssoSupport",
    label: "SSO/SAML support",
    help: "SSO reduces identity and offboarding risk.",
  },
  {
    name: "auditLogs",
    label: "Audit logs",
    help: "Logs support investigation and accountability.",
  },
  {
    name: "adminControls",
    label: "Admin controls",
    help: "Admin consoles help enforce organization-wide rules.",
  },
  {
    name: "complianceClaims",
    label: "SOC 2 / ISO or similar claims",
    help: "Documented claims reduce but do not eliminate risk.",
  },
  {
    name: "deletionSupport",
    label: "Data export/deletion support",
    help: "Deletion options matter for vendor offboarding.",
  },
  {
    name: "termsClarity",
    label: "Terms are clear",
    help: "Unclear terms should block broad approval.",
  },
  {
    name: "sensitiveDataHandling",
    label: "Sensitive data handling is documented",
    help: "Evidence is required before allowing sensitive data.",
  },
]

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      Save review
    </Button>
  )
}

function ControlSelect({
  label,
  help,
  name,
  value,
}: {
  label: string
  help: string
  name: keyof VendorReviewFormValues
  value: string
}) {
  return (
    <label className="grid gap-1.5">
      <span className={labelClassName}>{label}</span>
      <select className={fieldClassName} name={name} defaultValue={value}>
        {CONTROL_STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {CONTROL_STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      <span className={helpClassName}>{help}</span>
    </label>
  )
}

export function VendorReviewForm({
  action,
  initialState,
}: VendorReviewFormProps) {
  const [state, formAction] = useActionState(action, initialState)
  const values = state.values

  return (
    <form action={formAction} className="grid gap-5">
      {state.errors.form ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {state.errors.form}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {controlFields.map((field) => (
          <ControlSelect
            key={field.name}
            label={field.label}
            help={field.help}
            name={field.name}
            value={values[field.name]}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={labelClassName}>Business criticality</span>
          <select
            className={fieldClassName}
            name="businessCriticality"
            defaultValue={values.businessCriticality}
          >
            {BUSINESS_CRITICALITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {BUSINESS_CRITICALITY_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className={labelClassName}>Expected user base</span>
          <select
            className={fieldClassName}
            name="userBaseSize"
            defaultValue={values.userBaseSize}
          >
            {USER_BASE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {USER_BASE_SIZE_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className={labelClassName}>Reviewed at</span>
          <input
            className={fieldClassName}
            name="reviewedAt"
            type="date"
            defaultValue={values.reviewedAt}
          />
        </label>
        <label className="grid gap-1.5">
          <span className={labelClassName}>Next review at</span>
          <input
            className={fieldClassName}
            name="nextReviewAt"
            type="date"
            defaultValue={values.nextReviewAt}
          />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className={labelClassName}>Reviewer recommendation</span>
        <textarea
          className={`${fieldClassName} min-h-24 resize-y`}
          name="recommendation"
          defaultValue={values.recommendation}
          placeholder="Recommended status, limits, missing evidence, or review notes."
        />
      </label>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}
