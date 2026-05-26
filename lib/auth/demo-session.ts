import { getSession } from "@/lib/auth/session"

export async function getDemoSession() {
  return getSession()
}
