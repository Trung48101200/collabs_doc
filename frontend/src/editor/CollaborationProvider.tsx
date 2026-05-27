import { createContext, ReactNode, useContext } from "react";
import type { DocumentRole, User } from "../types";
import { useDocumentSocket } from "../hooks/useDocumentSocket";

interface CollaborationContextValue {
  ydoc: import("yjs").Doc;
  awareness: import("y-protocols/awareness").Awareness;
  connectionState: "connecting" | "online" | "offline";
  onlineUsers: User[];
  remoteCursors: Record<number, { from: number; to: number }>;
  writeBlocked: boolean;
  sendCursorUpdate: (cursor: { from: number; to: number }) => void;
  sendSaveRequest: () => void;
  sendVersionRequest: () => void;
  sendSyncRequest: () => void;
  applyYdocState: (ydocState: string) => void;
}

const CollaborationContext = createContext<CollaborationContextValue | undefined>(undefined);

export function CollaborationProvider({
  documentId,
  user,
  role,
  initialYdocState,
  children
}: {
  documentId: number;
  user: User;
  role: DocumentRole;
  initialYdocState?: string;
  children: ReactNode;
}) {
  const collaboration = useDocumentSocket(documentId, user, role, initialYdocState);

  return (
    <CollaborationContext.Provider value={collaboration}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error("useCollaboration must be used inside CollaborationProvider");
  }
  return context;
}
