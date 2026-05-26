"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import {
  createWorkspaceAction,
  type WorkspaceState,
} from "@/app/settings/actions"
import { Button } from "@/components/ui/button"

const fieldClassName =
  "min-h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      Create workspace
    </Button>
  )
}

export function CreateWorkspaceForm() {
  const initialState: WorkspaceState = { name: "" }
  const [state, formAction] = useActionState(createWorkspaceAction, initialState)

  return (
    <form action={formAction} className="grid gap-3">
      {state.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {state.error}
        </div>
      ) : null}
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Workspace name</span>
        <input
          className={fieldClassName}
          name="name"
          defaultValue={state.name}
          placeholder="Acme IT"
        />
      </label>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}
