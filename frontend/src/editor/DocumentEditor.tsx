import { useCallback, useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { CollaborationProvider, useCollaboration } from "./CollaborationProvider";
import { EditorToolbar } from "./EditorToolbar";
import { RichTextEditor } from "./RichTextEditor";
import { VersionPanel } from "./VersionPanel";
import { EditorPermissionGuard } from "./EditorPermissionGuard";
import { CursorLayer } from "./CursorLayer";
import { useAutosave } from "../hooks/useAutosave";
import { useCollaborators } from "../hooks/useCollaborators";
import { usePermission } from "../hooks/usePermission";
import { useEditorSync } from "../hooks/useEditorSync";
import { saveDocument } from "../services/documentApi";
import { encodeStateAsBase64 } from "../utils/yjsEncoding";
import type { DocumentModel, User } from "../types";
import type { Editor } from "@tiptap/react";

interface DocumentEditorProps {
  documentData: DocumentModel;
  user: User;
  isVersionOpen: boolean;
  onCloseVersions: () => void;
}

function DocumentEditorContent({ documentData, user, isVersionOpen, onCloseVersions }: DocumentEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const collaboration = useCollaboration();
  const { ydoc, awareness, onlineUsers, sendSaveRequest, sendSyncRequest } = collaboration;
  const { canEdit, showToolbar } = usePermission(documentData.role);
  const collaborators = useCollaborators(onlineUsers, user.id);

  const handleSave = useCallback(async () => {
    if (!editor) return;
    await saveDocument(documentData.id, {
      title: documentData.title,
      contentText: editor.getText(),
      contentJson: editor.getJSON(),
      contentHtml: editor.getHTML(),
      ydocState: encodeStateAsBase64(ydoc)
    }, user);
    sendSaveRequest();
  }, [documentData.id, documentData.title, editor, sendSaveRequest, user, ydoc]);

  useEditorSync(editor, ydoc, canEdit);
  useAutosave({ editor, ydoc, intervalMs: 8000, onSave: handleSave });

  useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
      const hasCommandModifier = event.ctrlKey || event.metaKey;
      if (hasCommandModifier && !event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleSaveShortcut, true);

    return () => {
      window.removeEventListener("keydown", handleSaveShortcut, true);
    };
  }, [handleSave]);

  return (
    <div className="editor-layout">
      {showToolbar ? <EditorToolbar editor={editor} disabled={!canEdit} /> : null}
      <CursorLayer collaborators={collaborators.peers} />
      <EditorPermissionGuard role={documentData.role}>
        <RichTextEditor documentData={documentData} ydoc={ydoc} awareness={awareness} user={user} editable={canEdit} onEditorReady={setEditor} />
      </EditorPermissionGuard>
      <VersionPanel
        documentId={documentData.id}
        user={user}
        canEdit={canEdit}
        isOpen={isVersionOpen}
        onClose={onCloseVersions}
        onBeforeCreateVersion={handleSave}
        onRestored={async () => {
          sendSyncRequest();
        }}
      />
    </div>
  );
}

export function DocumentEditor({ documentData, user, isVersionOpen, onCloseVersions }: DocumentEditorProps) {
  const initialState = useMemo(() => ({ documentData, user }), [documentData, user]);
  return (
    <CollaborationProvider documentId={documentData.id} user={user} role={documentData.role}>
      <DocumentEditorContent
        documentData={initialState.documentData}
        user={initialState.user}
        isVersionOpen={isVersionOpen}
        onCloseVersions={onCloseVersions}
      />
    </CollaborationProvider>
  );
}
