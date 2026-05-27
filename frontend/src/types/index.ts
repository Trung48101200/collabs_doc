export type DocumentRole = "owner" | "editor" | "viewer";

export interface User {
  id: number;
  name: string;
  email?: string;
  color: string;
  token?: string;
  refreshToken?: string;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  versionNumber: number;
  contentText?: string;
  contentJson?: unknown;
  contentHtml?: string;
  createdBy?: number | null;
  createdAt: string;
  ydocState?: string | null;
  changeSetKey?: string | null;
  fromUpdateId?: number | null;
  toUpdateId?: number | null;
  updateCount?: number;
}

export interface DocumentModel {
  id: number;
  title: string;
  contentText: string;
  contentJson: unknown;
  contentHtml: string;
  role: DocumentRole;
  ydocState?: string;
  versions?: DocumentVersion[];
}

export interface Collaborator {
  id: number;
  userId: number;
  name: string;
  email?: string;
  role: DocumentRole;
  createdAt?: string;
  color?: string;
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
