import { LoginForm } from "@/components/auth/login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log In</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Use the built-in demo login to create a local user session. This keeps
          the prototype self-contained while preserving the workspace membership
          model needed for Supabase Auth later.
        </p>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Demo session</CardTitle>
          <CardDescription>
            New emails are added as owners of the demo organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
