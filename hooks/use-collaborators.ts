"use client"

import { useCallback, useEffect, useState } from "react"

export interface Collaborator {
  id: string
  email: string
  name: string | null
  imageUrl: string | null
}

interface UseCollaboratorsResult {
  collaborators: Collaborator[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  invite: (email: string) => Promise<boolean>
  remove: (collaboratorId: string) => Promise<void>
}

async function getError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null
  return body?.error ?? "Something went wrong. Please try again."
}

export function useCollaborators(projectId: string): UseCollaboratorsResult {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endpoint = `/api/projects/${projectId}/collaborators`

  useEffect(() => {
    let isCurrent = true

    async function load() {
      try {
        const response = await fetch(endpoint)

        if (!response.ok) throw new Error(await getError(response))

        const body = (await response.json()) as { collaborators: Collaborator[] }

        if (isCurrent) setCollaborators(body.collaborators)
      } catch (loadError) {
        if (isCurrent) setError(loadError instanceof Error ? loadError.message : "Could not load collaborators.")
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void load()

    return () => {
      isCurrent = false
    }
  }, [endpoint])

  const invite = useCallback(
    async (email: string) => {
      setIsSubmitting(true)
      setError(null)

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })

        if (!response.ok) throw new Error(await getError(response))

        const body = (await response.json()) as { collaborator: Collaborator }

        setCollaborators((current) => [...current, body.collaborator])
        return true
      } catch (inviteError) {
        setError(inviteError instanceof Error ? inviteError.message : "Could not invite collaborator.")
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [endpoint]
  )

  const remove = useCallback(
    async (collaboratorId: string) => {
      setIsSubmitting(true)
      setError(null)

      try {
        const response = await fetch(`${endpoint}/${collaboratorId}`, { method: "DELETE" })

        if (!response.ok) throw new Error(await getError(response))

        setCollaborators((current) => current.filter((collaborator) => collaborator.id !== collaboratorId))
      } catch (removeError) {
        setError(removeError instanceof Error ? removeError.message : "Could not remove collaborator.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [endpoint]
  )

  return { collaborators, isLoading, isSubmitting, error, invite, remove }
}
