"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
  Wrench,
} from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: "AI Tools",
    href: "/tools",
    icon: Wrench,
    enabled: true,
  },
  {
    label: "Policies",
    href: "/policies",
    icon: FileText,
    enabled: false,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: Shield,
    enabled: false,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    enabled: false,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          ClearUse AI
        </p>
        <h1 className="text-lg font-semibold">AI Governance</h1>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.enabled &&
            (item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href))

          if (!item.enabled) {
            return (
              <span
                key={item.label}
                className="flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground/60"
                title="Coming in a later step"
              >
                <Icon className="size-4" />
                {item.label}
              </span>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        Step 1: read-only registry
      </p>
    </aside>
  )
}
