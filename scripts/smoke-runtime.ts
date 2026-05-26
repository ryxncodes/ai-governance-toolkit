const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000"

const checks = [
  { path: "/", expected: "Dashboard" },
  { path: "/tools", expected: "AI Tools" },
  { path: "/approved-tools", expected: "Employee AI Tool Guide" },
  { path: "/policies", expected: "Policy Auditor" },
  { path: "/reports", expected: "Reports" },
  { path: "/safety-tester", expected: "AI App Safety Tester" },
  { path: "/settings", expected: "Workspace" },
  { path: "/login", expected: "Demo session" },
]

async function assertPage(path: string, expected: string) {
  const response = await fetch(`${baseUrl}${path}`)
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`)
  }

  const body = await response.text()
  if (!body.includes(expected)) {
    throw new Error(`${path} did not include expected text: ${expected}`)
  }
}

async function assertHealth() {
  const response = await fetch(`${baseUrl}/api/health`)
  if (!response.ok) {
    throw new Error(`/api/health returned ${response.status}`)
  }

  const body = (await response.json()) as {
    ok?: boolean
    counts?: { tools?: number; memberships?: number }
  }

  if (!body.ok || !body.counts || (body.counts.tools ?? 0) < 1) {
    throw new Error("/api/health did not report seeded tool data")
  }

  if ((body.counts.memberships ?? 0) < 1) {
    throw new Error("/api/health did not report seeded membership data")
  }
}

async function main() {
  await assertHealth()
  for (const check of checks) {
    await assertPage(check.path, check.expected)
  }

  console.log(`Runtime smoke checks passed for ${baseUrl}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
