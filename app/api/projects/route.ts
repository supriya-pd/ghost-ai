import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const defaultProjectName = "Untitled Project";

interface CreateProjectBody {
  name?: unknown;
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function parseCreateProjectBody(request: Request): Promise<string | Response> {
  let body: CreateProjectBody;

  try {
    body = (await request.json()) as CreateProjectBody;
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("Request body must be an object.", 400);
  }

  if (body.name === undefined) {
    return defaultProjectName;
  }

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return errorResponse("Project name must be a non-empty string.", 400);
  }

  return body.name.trim();
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Authentication required.", 401);
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Authentication required.", 401);
  }

  const name = await parseCreateProjectBody(request);

  if (name instanceof Response) {
    return name;
  }

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name,
    },
  });

  return Response.json({ project }, { status: 201 });
}
