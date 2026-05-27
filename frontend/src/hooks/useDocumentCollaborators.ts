import { useEffect, useState } from "react";
import type { Collaborator, User } from "../types";
import {
  inviteCollaborator,
  listCollaborators,
  removeCollaborator,
  updateCollaboratorRole
} from "../services/collaboratorApi";

interface UseDocumentCollaboratorsResult {
  collaborators: Collaborator[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  invite: (email: string, role: "editor" | "viewer") => Promise<void>;
  remove: (userId: number) => Promise<void>;
  updateRole: (userId: number, role: "editor" | "viewer") => Promise<void>;
}

const fallbackColors = ["#2563eb", "#7c3aed", "#059669", "#f97316", "#dc2626"];

function applyColor(collaborator: Collaborator) {
  const index = collaborator.userId % fallbackColors.length;
  return { ...collaborator, color: fallbackColors[index] };
}

export function useDocumentCollaborators(documentId: number, user: User): UseDocumentCollaboratorsResult {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCollaborators() {
    setLoading(true);
    try {
      const result = await listCollaborators(documentId, user);
      setCollaborators(result.map(applyColor));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load collaborators");
    } finally {
      setLoading(false);
    }
  }

  async function invite(email: string, role: "editor" | "viewer") {
    await inviteCollaborator(documentId, { email, role }, user);
    await loadCollaborators();
  }

  async function remove(userId: number) {
    await removeCollaborator(documentId, userId, user);
    await loadCollaborators();
  }

  async function updateRole(userId: number, role: "editor" | "viewer") {
    await updateCollaboratorRole(documentId, userId, role, user);
    await loadCollaborators();
  }

  useEffect(() => {
    loadCollaborators();
  }, [documentId, user]);

  return { collaborators, loading, error, refresh: loadCollaborators, invite, remove, updateRole };
}
