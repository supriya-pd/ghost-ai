import { getCurrentIdentity } from "@/lib/project-access"
import { enrichCollaborators, listProjectCollaborators, normalizeEmail } from "@/lib/collaborators"
import { prisma } from "@/lib/prisma"

interface CollaboratorsRouteContext {
  params: Promise<{ projectId: string }>
}

interface InviteCollaboratorBody {
  email?: unknown
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

async function parseInviteBody(request: Request): Promise<string | Response> {
  let body: InviteCollaboratorBody

  try {
    body = (await request.json()) as InviteCollaboratorBody
  } catch {
    return errorResponse("Request body must be valid JSON.", 400)
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("Request body must be an object.", 400)
  }

  const email = normalizeEmail(body.email)

  if (!email) {
    return errorResponse("Enter a valid email address.", 400)
  }

  return email
}

export async function GET(_request: Request, context: CollaboratorsRouteContext) {
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    return errorResponse("Authentication required.", 401)
  }

  const { projectId } = await context.params
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: identity.primaryEmail
        ? [
            { ownerId: identity.userId },
            { collaborators: { some: { collaboratorEmail: identity.primaryEmail } } },
          ]
        : [{ ownerId: identity.userId }],
    },
    select: { ownerId: true },
  })

  if (!project) {
    return errorResponse("Project not found.", 404)
  }

  const collaborators = await listProjectCollaborators(projectId)

  return Response.json({ collaborators, isOwner: project.ownerId === identity.userId })
}

export async function POST(request: Request, context: CollaboratorsRouteContext) {
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    return errorResponse("Authentication required.", 401)
  }

  const { projectId } = await context.params
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })

  if (!project) {
    return errorResponse("Project not found.", 404)
  }

  if (project.ownerId !== identity.userId) {
    return errorResponse("Only the project owner can invite collaborators.", 403)
  }

  const email = await parseInviteBody(request)

  if (email instanceof Response) {
    return email
  }

  if (email === identity.primaryEmail?.toLowerCase()) {
    return errorResponse("You already own this project.", 400)
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_collaboratorEmail: { projectId, collaboratorEmail: email } },
    select: { id: true },
  })

  if (existing) {
    return errorResponse("This person is already a collaborator.", 409)
  }

  const record = await prisma.projectCollaborator.create({
    data: { projectId, collaboratorEmail: email },
    select: { id: true, collaboratorEmail: true },
  })
  const [collaborator] = await enrichCollaborators([record])

  return Response.json({ collaborator }, { status: 201 })
}
