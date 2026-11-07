import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/editor/access-denied"
import { EditorWorkspace } from "@/components/editor/editor-workspace"
import { getAccessibleProject, getCurrentIdentity } from "@/lib/project-access"
import { getEditorProjects } from "@/lib/projects"

export const instant = false

interface EditorRoomPageProps {
  params: Promise<{ roomId: string }>
}

export default async function EditorRoomPage({ params }: EditorRoomPageProps) {
  const { roomId } = await params
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/editor/${roomId}`)}`)
  }

  const project = await getAccessibleProject(roomId)

  if (!project) return <AccessDenied />

  const projects = await getEditorProjects()

  return (
    <EditorWorkspace
      project={{ ...project, isOwner: project.ownerId === identity.userId }}
      ownedProjects={projects.owned}
      sharedProjects={projects.shared}
    />
  )
}
