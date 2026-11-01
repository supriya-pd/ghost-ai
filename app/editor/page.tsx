import { EditorShell } from "@/components/editor/editor-shell";
import { getEditorProjects } from "@/lib/projects";

export const instant = false

export default async function EditorPage() {
  const projects = await getEditorProjects()
  return <EditorShell ownedProjects={projects.owned} sharedProjects={projects.shared} />
}
