import type { DocumentModel, User } from "../types";
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

export function createVersion(id: number, user: User): Promise<void> {
  return apiFetch<void>(`/api/documents/${id}/versions`, {
    method: "POST",
    body: JSON.stringify({})
  }, user);
}
