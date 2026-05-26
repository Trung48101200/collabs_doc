import { useEffect, useState } from "react";
import type { DocumentVersion, User } from "../types";
import { listVersions } from "../services/documentApi";

interface UseDocumentVersionsResult {
  versions: DocumentVersion[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDocumentVersions(documentId: number, user: User): UseDocumentVersionsResult {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadVersions() {
    setLoading(true);
    try {
      const result = await listVersions(documentId, user);
      setVersions(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load versions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVersions();
  }, [documentId, user]);

  return { versions, loading, error, refresh: loadVersions };
}
