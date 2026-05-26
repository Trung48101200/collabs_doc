import { createContext, ReactNode, useContext } from "react";
import type { DocumentRole, User } from "../types";
import { useDocumentSocket } from "../hooks/useDocumentSocket";

interface CollaborationContextValue {
  ydoc: import("yjs").Doc;
  awareness: import("y-protocols/awareness").Awareness;
  connectionState: "connecting" | "online" | "offline";
  onlineUsers: User[];
  sendSaveRequest: () => void;
  sendVersionRequest: () => void;
  sendSyncRequest: () => void;
}

const CollaborationContext = createContext<CollaborationContextValue | undefined>(undefined);

export function CollaborationProvider({
  documentId,
  user,
  role,
  children
}: {
  documentId: number;
  user: User;
  role: DocumentRole;
  children: ReactNode;
}) {
  const collaboration = useDocumentSocket(documentId, user, role);

  return <CollaborationContext.Provider value={collaboration}>{children}</CollaborationContext.Provider>;
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error("useCollaboration must be used inside CollaborationProvider");
  }
  return context;
}
