import { apiFetch } from "./api.js";

export function listDocuments(user) {
  return apiFetch("/api/documents", {}, user);
}

export function createDocument(title, user) {
  return apiFetch(
    "/api/documents",
    {
      method: "POST",
      body: JSON.stringify({ title })
    },
    user
  );
}

export function getDocument(id, user) {
  return apiFetch(`/api/documents/${id}`, {}, user);
}

export function saveDocument(id, payload, user) {
  return apiFetch(
    `/api/documents/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload)
    },
    user
  );
}

export function createVersion(id, user) {
  return apiFetch(
    `/api/documents/${id}/versions`,
    {
      method: "POST",
      body: JSON.stringify({})
    },
    user
  );
}
