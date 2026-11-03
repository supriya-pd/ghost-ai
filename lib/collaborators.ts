import { clerkClient } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

export interface ProjectCollaboratorView {
  id: string
  email: string
  name: string | null
  imageUrl: string | null
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null

  const email = value.trim().toLowerCase()

  return email.length <= 254 && emailPattern.test(email) ? email : null
}

interface ClerkProfile {
  name: string | null
  imageUrl: string | null
}

async function getClerkProfiles(emails: string[]): Promise<Map<string, ClerkProfile>> {
  const profiles = new Map<string, ClerkProfile>()

  if (emails.length === 0) return profiles

  try {
    const client = await clerkClient()
    const { data: users } = await client.users.getUserList({ emailAddress: emails, limit: 100 })

    for (const user of users) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null

      for (const address of user.emailAddresses) {
        const email = address.emailAddress.toLowerCase()

        if (emails.includes(email) && !profiles.has(email)) {
          profiles.set(email, { name, imageUrl: user.imageUrl || null })
        }
      }
    }
  } catch {
    // Clerk enrichment is best-effort; callers fall back to email only.
  }

  return profiles
}

export async function enrichCollaborators(
  records: Array<{ id: string; collaboratorEmail: string }>
): Promise<ProjectCollaboratorView[]> {
  const profiles = await getClerkProfiles(records.map((record) => record.collaboratorEmail.toLowerCase()))

  return records.map((record) => {
    const profile = profiles.get(record.collaboratorEmail.toLowerCase())

    return {
      id: record.id,
      email: record.collaboratorEmail,
      name: profile?.name ?? null,
      imageUrl: profile?.imageUrl ?? null,
    }
  })
}

export async function listProjectCollaborators(projectId: string): Promise<ProjectCollaboratorView[]> {
  const records = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { id: true, collaboratorEmail: true },
  })

  return enrichCollaborators(records)
}
