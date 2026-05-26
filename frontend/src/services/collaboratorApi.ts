import type { Collaborator, DocumentRole, User } from "../types";
import { apiFetch } from "./api";

export function listCollaborators(documentId: number, user: User): Promise<Collaborator[]> {
  return apiFetch<Collaborator[]>(`/api/documents/${documentId}/collaborators`, {}, user);
}

export function inviteCollaborator(
  documentId: number,
  payload: { email: string; role: Exclude<DocumentRole, "owner"> },
  user: User
): Promise<{ message: string; collaborator: Collaborator }> {
  return apiFetch<{ message: string; collaborator: Collaborator }>(
    `/api/documents/${documentId}/collaborators`,
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    user
  );
}

export function updateCollaboratorRole(
  documentId: number,
  targetUserId: number,
  role: Exclude<DocumentRole, "owner">,
  user: User
): Promise<{ message: string; collaborator: Collaborator }> {
  return apiFetch<{ message: string; collaborator: Collaborator }>(
    `/api/documents/${documentId}/collaborators/${targetUserId}`,
    {
      method: "PUT",
      body: JSON.stringify({ role })
    },
    user
  );
}

export function removeCollaborator(documentId: number, targetUserId: number, user: User): Promise<void> {
  return apiFetch<void>(`/api/documents/${documentId}/collaborators/${targetUserId}`, {
    method: "DELETE"
  }, user);
}
