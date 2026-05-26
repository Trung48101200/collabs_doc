export type DocumentRole = "owner" | "editor" | "viewer";

export interface User {
  id: number;
  name: string;
  color: string;
  token?: string;
}

export interface DocumentVersion {
  id: number;
  title: string;
  createdAt: string;
}

export interface DocumentModel {
  id: number;
  title: string;
  contentText: string;
  contentJson: unknown;
  contentHtml: string;
  role: DocumentRole;
  versions?: DocumentVersion[];
}

export interface SocketUserState {
  id: number;
  name: string;
  color: string;
}

export interface DocumentSocketPayloads {
  joinDocument: {
    documentId: number;
    user: User;
  };
  leaveDocument: {
    documentId: number;
    userId: number;
  };
  yjsUpdate: {
    documentId: number;
    userId: number;
    update: number[];
    clientId: string;
  };
  awarenessUpdate: {
    documentId: number;
    update: number[];
    clientId: string;
  };
  cursorUpdate: {
    documentId: number;
    userId: number;
    cursor: { from: number; to: number };
  };
  selectionUpdate: {
    documentId: number;
    userId: number;
    selection: { from: number; to: number };
  };
  saveDocument: {
    documentId: number;
    userId: number;
  };
  createVersion: {
    documentId: number;
    userId: number;
  };
  reconnectSync: {
    documentId: number;
    ydocState: string;
    clientId: string;
  };
}
