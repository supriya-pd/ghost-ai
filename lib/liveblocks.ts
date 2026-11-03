import { Liveblocks } from "@liveblocks/node"

const cursorColors = [
  "#00c8d4",
  "#6457f9",
  "#34d399",
  "#fbbf24",
  "#ff6166",
  "#bf7af0",
  "#52a8ff",
  "#f75f8f",
] as const

interface LiveblocksGlobal {
  client?: Liveblocks
}

const globalForLiveblocks = globalThis as unknown as LiveblocksGlobal

export function getLiveblocksClient(): Liveblocks {
  if (globalForLiveblocks.client) return globalForLiveblocks.client

  const secret = process.env.LIVEBLOCKS_SECRET_KEY

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY must be set to initialize Liveblocks.")
  }

  const client = new Liveblocks({ secret })

  if (process.env.NODE_ENV !== "production") {
    globalForLiveblocks.client = client
  }

  return client
}

export function getCursorColor(userId: string): string {
  let hash = 0

  for (const character of userId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return cursorColors[hash % cursorColors.length]
}
