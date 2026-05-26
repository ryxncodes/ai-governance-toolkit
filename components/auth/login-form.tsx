"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import { loginAction, type LoginState } from "@/app/login/actions"
import { Button } from "@/components/ui/button"

const fieldClassName =
  "min-h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      Log in
    </Button>
  )
}

export function LoginForm() {
  const initialState: LoginState = { email: "", name: "" }
  const [state, formAction] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {state.error}
        </div>
      ) : null}
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Email</span>
        <input
          className={fieldClassName}
          name="email"
          type="email"
          defaultValue={state.email}
          placeholder="it.owner@example.com"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Name</span>
        <input
          className={fieldClassName}
          name="name"
          defaultValue={state.name}
          placeholder="IT Owner"
        />
      </label>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}
