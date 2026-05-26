import { ShieldCheck, Users } from "lucide-react"

import { logoutAction } from "@/app/login/actions"
import { CreateWorkspaceForm } from "@/components/settings/create-workspace-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getRequiredSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import {
  permissionsForRole,
  roleDescription,
  roleLabel,
} from "@/lib/auth/permissions"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await getRequiredSession()
  const organization = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    include: {
      memberships: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })
  const workspaces = await prisma.membership.findMany({
    where: { userId: session.userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Manage the current workspace, demo login session, and role model used
          by the registry and review workflows.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Organization
            </CardTitle>
            <CardDescription>
              Current workspace used by the registry and review workflows.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Signed in as
              </p>
              <p>{session.user.name ?? "Demo IT Owner"}</p>
              <p className="text-muted-foreground">
                {session.user.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Name
              </p>
              <p>{organization?.name ?? "Demo Organization"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Organization ID
              </p>
              <p className="font-mono text-xs">
                {organization?.id ?? session.organizationId}
              </p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                Log out
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" />
              Role Permissions
            </CardTitle>
            <CardDescription>
              Permission model used by owners, admins, reviewers, and viewers.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(["OWNER", "ADMIN", "REVIEWER", "VIEWER"] as const).map((role) => (
              <div key={role} className="grid gap-1 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{roleLabel(role)}</p>
                  <Badge variant="secondary">
                    {permissionsForRole(role).length} permissions
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {roleDescription(role)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create workspace</CardTitle>
            <CardDescription>
              Add a separate workspace for another client, school, or business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWorkspaceForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your workspaces</CardTitle>
            <CardDescription>
              Workspaces currently connected to this browser session.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {workspaces.map((membership) => (
              <div
                key={membership.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{membership.organization.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {membership.organization.id}
                  </p>
                </div>
                <Badge
                  variant={
                    membership.organizationId === session.organizationId
                      ? "default"
                      : "secondary"
                  }
                >
                  {membership.organizationId === session.organizationId
                    ? "Current"
                    : roleLabel(membership.role)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Users connected to the current workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {organization?.memberships.map((membership) => (
                  <tr key={membership.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      {membership.user.name ?? "Unnamed user"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {membership.user.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{roleLabel(membership.role)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
