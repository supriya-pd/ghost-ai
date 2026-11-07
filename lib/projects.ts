import { auth, currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

export interface EditorProject {
  id: string
  name: string
  isOwner: boolean
}

export interface EditorProjects {
  owned: EditorProject[]
  shared: EditorProject[]
}

export async function getEditorProjects(): Promise<EditorProjects> {
  const { userId } = await auth()
  if (!userId) return { owned: [], shared: [] }

  let collaboratorEmail: string | undefined
  try {
    collaboratorEmail = (await currentUser())?.primaryEmailAddress?.emailAddress
  } catch {
    collaboratorEmail = undefined
  }
  const [owned, shared] = await Promise.all([
    prisma.project.findMany({ where: { ownerId: userId }, orderBy: { updatedAt: "desc" }, select: { id: true, name: true } }),
    collaboratorEmail
      ? prisma.project.findMany({ where: { collaborators: { some: { collaboratorEmail } } }, orderBy: { updatedAt: "desc" }, select: { id: true, name: true } })
      : Promise.resolve([]),
  ])

  return {
    owned: owned.map((project) => ({ ...project, isOwner: true })),
    shared: shared.map((project) => ({ ...project, isOwner: false })),
  }
}
