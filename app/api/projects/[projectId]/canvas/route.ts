import { get, put } from "@vercel/blob"
import { auth } from "@clerk/nextjs/server"

import { parseCanvasSnapshot } from "@/lib/canvas-snapshot"
import { prisma } from "@/lib/prisma"
import { getAccessibleProject } from "@/lib/project-access"

interface CanvasRouteContext {
  params: Promise<{ projectId: string }>
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export async function GET(_request: Request, context: CanvasRouteContext) {
  const { userId } = await auth()
  if (!userId) return errorResponse("Authentication required.", 401)

  const { projectId } = await context.params
  const project = await getAccessibleProject(projectId)
  if (!project) return errorResponse("Project not found.", 404)
  if (!project.canvasJsonPath) return Response.json({ canvas: null })

  try {
    const blob = await get(project.canvasJsonPath, { access: "private" })
    if (!blob || blob.statusCode !== 200) return errorResponse("Saved canvas could not be loaded.", 502)

    const snapshot = parseCanvasSnapshot(await new Response(blob.stream).json())
    if (!snapshot) return errorResponse("Saved canvas is invalid.", 502)

    return Response.json({ canvas: snapshot })
  } catch {
    return errorResponse("Saved canvas could not be loaded.", 502)
  }
}

export async function PUT(request: Request, context: CanvasRouteContext) {
  const { userId } = await auth()
  if (!userId) return errorResponse("Authentication required.", 401)

  const { projectId } = await context.params
  const project = await getAccessibleProject(projectId)
  if (!project) return errorResponse("Project not found.", 404)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse("Request body must be valid JSON.", 400)
  }

  const snapshot = parseCanvasSnapshot(body)
  if (!snapshot) return errorResponse("Canvas must include valid nodes and edges arrays.", 400)

  try {
    const blob = await put(`canvas/${projectId}.json`, JSON.stringify(snapshot), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    })

    await prisma.project.update({ where: { id: projectId }, data: { canvasJsonPath: blob.url } })
    return Response.json({ canvasJsonPath: blob.url })
  } catch {
    return errorResponse("Canvas could not be saved.", 502)
  }
}
