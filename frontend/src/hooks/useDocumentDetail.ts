import { useEffect, useState } from "react";
import type { DocumentModel, User } from "../types";
import { getDocument } from "../services/documentApi";

interface UseDocumentDetailResult {
  document: DocumentModel | null;
  loading: boolean;
  error: string | null;
}

export function useDocumentDetail(documentId: number, user: User): UseDocumentDetailResult {
  const [document, setDocument] = useState<DocumentModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await getDocument(documentId, user);
        if (!cancelled) {
          setDocument(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load document");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [documentId, user]);

  return { document, loading, error };
}
