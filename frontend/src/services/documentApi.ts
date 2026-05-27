import type { DocumentModel, DocumentVersion, User } from "../types";
import { apiFetch } from "./api";
import {
  createMockDocument,
  getMockDocument,
  listMockDocuments
} from "../mocks/mockData";

const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

export function listDocuments(user: User): Promise<DocumentModel[]> {
  if (useMocks) {
    return listMockDocuments();
  }

  return apiFetch<DocumentModel[]>("/api/documents", {}, user);
}

export function createDocument(title: string, user: User): Promise<DocumentModel> {
  if (useMocks) {
    return createMockDocument(title, user);
  }

  return apiFetch<DocumentModel>("/api/documents", {
    method: "POST",
    body: JSON.stringify({ title })
  }, user);
}

export function getDocument(id: number, user: User): Promise<DocumentModel> {
  if (useMocks) {
    return getMockDocument(id);
  }

  return apiFetch<DocumentModel>(`/api/documents/${id}`, {}, user);
}

export function saveDocument(id: number, payload: Partial<DocumentModel> & { ydocState: string }, user: User): Promise<DocumentModel> {
  return apiFetch<DocumentModel>(`/api/documents/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  }, user);
}

export function updateDocumentTitle(id: number, title: string, user: User): Promise<DocumentModel> {
  return apiFetch<DocumentModel>(`/api/documents/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title })
  }, user);
}

export function createVersion(id: number, user: User): Promise<DocumentVersion> {
  return apiFetch<DocumentVersion>(`/api/documents/${id}/versions`, {
    method: "POST",
    body: JSON.stringify({})
  }, user);
}

export function listVersions(id: number, user: User): Promise<DocumentVersion[]> {
  return apiFetch<DocumentVersion[]>(`/api/documents/${id}/versions`, {}, user);
}

export function getVersionDetail(id: number, versionId: number, user: User): Promise<DocumentVersion> {
  return apiFetch<DocumentVersion>(`/api/documents/${id}/versions/${versionId}`, {}, user);
}

export async function restoreVersion(id: number, versionId: number, user: User): Promise<DocumentModel> {
  const result = await apiFetch<{ message: string; document: DocumentModel }>(`/api/documents/${id}/versions/${versionId}/restore`, {
    method: "POST",
    body: JSON.stringify({})
  }, user);
  return result.document;
}

export function deleteDocument(id: number, user: User): Promise<void> {
  return apiFetch<void>(`/api/documents/${id}`, {
    method: "DELETE"
  }, user);
}

export function copyDocument(id: number, user: User, title?: string): Promise<DocumentModel> {
  return apiFetch<DocumentModel>(`/api/documents/${id}/copy`, {
    method: "POST",
    body: JSON.stringify({ title })
  }, user);
}
