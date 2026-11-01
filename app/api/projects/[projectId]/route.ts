import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

interface RenameProjectBody {
  name?: unknown;
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function getOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return { response: errorResponse("Project not found.", 404) };
  }

  if (project.ownerId !== userId) {
    return { response: errorResponse("Only the project owner can mutate it.", 403) };
  }

  return { project };
}

async function parseRenameProjectBody(request: Request): Promise<string | Response> {
  let body: RenameProjectBody;

  try {
    body = (await request.json()) as RenameProjectBody;
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("Request body must be an object.", 400);
  }

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return errorResponse("Project name must be a non-empty string.", 400);
  }

  return body.name.trim();
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Authentication required.", 401);
  }

  const { projectId } = await context.params;
  const ownedProject = await getOwnedProject(projectId, userId);

  if (ownedProject.response) {
    return ownedProject.response;
  }

  const name = await parseRenameProjectBody(request);

  if (name instanceof Response) {
    return name;
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  });

  return Response.json({ project });
}

export async function DELETE(_request: Request, context: ProjectRouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Authentication required.", 401);
  }

  const { projectId } = await context.params;
  const ownedProject = await getOwnedProject(projectId, userId);

  if (ownedProject.response) {
    return ownedProject.response;
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return new Response(null, { status: 204 });
}
