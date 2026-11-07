import { currentUser } from "@clerk/nextjs/server"

import { getCursorColor, getLiveblocksClient } from "@/lib/liveblocks"
import { getAccessibleProject, getCurrentIdentity } from "@/lib/project-access"

interface LiveblocksAuthBody {
  room?: unknown
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

async function parseRoomId(request: Request): Promise<string | Response> {
  let body: LiveblocksAuthBody

  try {
    body = (await request.json()) as LiveblocksAuthBody
  } catch {
    return errorResponse("Request body must be valid JSON.", 400)
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("Request body must be an object.", 400)
  }

  if (typeof body.room !== "string" || body.room.trim().length === 0) {
    return errorResponse("A room is required.", 400)
  }

  return body.room.trim()
}

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    return errorResponse("Authentication required.", 401)
  }

  const projectId = await parseRoomId(request)

  if (projectId instanceof Response) {
    return projectId
  }

  const project = await getAccessibleProject(projectId)

  if (!project) {
    return errorResponse("You do not have access to this project.", 403)
  }

  let userName = identity.primaryEmail ?? identity.userId
  let avatar = ""

  try {
    const user = await currentUser()
    userName = user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? userName
    avatar = user?.imageUrl ?? avatar
  } catch {
    // The identity and project access checks above are sufficient to issue a session.
  }

  const liveblocks = getLiveblocksClient()

  await liveblocks.getOrCreateRoom(project.id, {
    defaultAccesses: [],
  })

  const session = liveblocks.prepareSession(identity.userId, {
    userInfo: { name: userName, avatar, color: getCursorColor(identity.userId) },
  })
  session.allow(project.id, ["*:write"])

  const authorization = await session.authorize()

  return new Response(authorization.body, {
    status: authorization.status,
    headers: { "content-type": "application/json" },
  })
}
