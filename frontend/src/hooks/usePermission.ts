import type { DocumentRole } from "../types";

export function usePermission(role: DocumentRole) {
  return {
    canEdit: role !== "viewer",
    showToolbar: role !== "viewer",
    isViewer: role === "viewer",
    isOwner: role === "owner",
    isEditor: role === "editor"
  };
}
