import { getCurrentIdentity } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"

interface CollaboratorRouteContext {
  params: Promise<{ projectId: string; collaboratorId: string }>
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export async function DELETE(_request: Request, context: CollaboratorRouteContext) {
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    return errorResponse("Authentication required.", 401)
  }

  const { projectId, collaboratorId } = await context.params
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })

  if (!project) {
    return errorResponse("Project not found.", 404)
  }

  if (project.ownerId !== identity.userId) {
    return errorResponse("Only the project owner can remove collaborators.", 403)
  }

  const { count } = await prisma.projectCollaborator.deleteMany({
    where: { id: collaboratorId, projectId },
  })

  if (count === 0) {
    return errorResponse("Collaborator not found.", 404)
  }

  return new Response(null, { status: 204 })
}
