import { auth, currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

export interface CurrentIdentity {
  userId: string | null
  primaryEmail: string | null
}

export interface AccessibleProject {
  id: string
  name: string
  ownerId: string
  canvasJsonPath: string | null
}

export async function getCurrentIdentity(): Promise<CurrentIdentity> {
  const { userId } = await auth()

  if (!userId) return { userId: null, primaryEmail: null }

  try {
    const user = await currentUser()
    return { userId, primaryEmail: user?.primaryEmailAddress?.emailAddress ?? null }
  } catch {
    return { userId, primaryEmail: null }
  }
}

export async function getAccessibleProject(projectId: string): Promise<AccessibleProject | null> {
  const identity = await getCurrentIdentity()

  if (!identity.userId) return null

  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: identity.primaryEmail
        ? [
            { ownerId: identity.userId },
            { collaborators: { some: { collaboratorEmail: identity.primaryEmail } } },
          ]
        : [{ ownerId: identity.userId }],
    },
    select: { id: true, name: true, ownerId: true, canvasJsonPath: true },
  })
}
