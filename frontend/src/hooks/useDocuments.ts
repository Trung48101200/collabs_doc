import { useEffect, useState } from "react";
import type { DocumentModel, User } from "../types";
import { createDocument, listDocuments } from "../services/documentApi";

interface UseDocumentsResult {
  documents: DocumentModel[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (title: string) => Promise<DocumentModel>;
}

export function useDocuments(user: User): UseDocumentsResult {
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDocuments() {
    setLoading(true);
    try {
      const result = await listDocuments(user);
      setDocuments(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load documents");
    } finally {
      setLoading(false);
    }
  }

  async function create(title: string) {
    const document = await createDocument(title, user);
    await loadDocuments();
    return document;
  }

  useEffect(() => {
    loadDocuments();
  }, [user]);

  return { documents, loading, error, refresh: loadDocuments, create };
}
