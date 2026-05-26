import { useEffect, useState } from "react";
import type { DocumentModel, User } from "../types";
import { getDocument } from "../services/documentApi";

interface UseDocumentDetailResult {
  document: DocumentModel | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDocumentDetail(documentId: number, user: User): UseDocumentDetailResult {
  const [document, setDocument] = useState<DocumentModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const result = await getDocument(documentId, user);
      setDocument(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load document");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) {
        setError("Unable to load document");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [documentId, user]);

  return { document, loading, error, refresh: load };
}
