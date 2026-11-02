import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";
import { getCurrentIdentity } from "@/lib/project-access";
import { getEditorProjects } from "@/lib/projects";

export const instant = false

export default async function EditorPage() {
  const identity = await getCurrentIdentity();

  if (!identity.userId) redirect("/sign-in");

  const projects = await getEditorProjects()
  return <EditorShell ownedProjects={projects.owned} sharedProjects={projects.shared} />
}
