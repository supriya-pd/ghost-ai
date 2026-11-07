"use client"

import { useEffect, useState } from "react"

import { projectFromData, type Project } from "@/hooks/use-project-actions"

interface ApiProject {
  id: string
  name: string
  isOwner: boolean
}

interface ApiProjectsResponse {
  projects?: ApiProject[]
}

interface ProjectLists {
  myProjects: Project[]
  sharedProjects: Project[]
}

const projectRefreshInterval = 5000

async function fetchProjectLists(): Promise<ProjectLists | null> {
  const response = await fetch("/api/projects", { cache: "no-store" })
  if (!response.ok) return null

  const body = (await response.json()) as ApiProjectsResponse
  if (!Array.isArray(body.projects)) return null

  const projects = body.projects.map(projectFromData)
  return {
    myProjects: projects.filter((project) => project.isOwner),
    sharedProjects: projects.filter((project) => !project.isOwner),
  }
}

export function useProjectListRefresh(initial: ProjectLists, isEnabled: boolean): ProjectLists {
  const [projects, setProjects] = useState(initial)

  useEffect(() => {
    if (!isEnabled) return

    let isCurrent = true
    const refresh = async () => {
      const nextProjects = await fetchProjectLists()
      if (isCurrent && nextProjects) setProjects(nextProjects)
    }

    void refresh()
    const intervalId = window.setInterval(() => void refresh(), projectRefreshInterval)
    return () => {
      isCurrent = false
      window.clearInterval(intervalId)
    }
  }, [isEnabled])

  return projects
}
