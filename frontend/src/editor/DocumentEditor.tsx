import { useMemo, useState } from "react";
import * as Y from "yjs";
import { CollaborationProvider, useCollaboration } from "./CollaborationProvider";
import { EditorToolbar } from "./EditorToolbar";
import { RichTextEditor } from "./RichTextEditor";
import { EditorStatus } from "./EditorStatus";
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

function DocumentEditorContent({ documentData, user }: { documentData: DocumentModel; user: User }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const collaboration = useCollaboration();
  const { ydoc, awareness, connectionState, onlineUsers, sendSaveRequest, sendVersionRequest } = collaboration;
  const { canEdit, showToolbar } = usePermission(documentData.role);
  const collaborators = useCollaborators(onlineUsers, user.id);

  const handleSave = async () => {
    if (!editor) return;
    await saveDocument(documentData.id, {
      title: documentData.title,
      contentText: editor.getText(),
      contentJson: editor.getJSON(),
      contentHtml: editor.getHTML(),
      ydocState: encodeStateAsBase64(ydoc)
    }, user);
    sendSaveRequest();
  };

  useEditorSync(editor, ydoc, canEdit);
  useAutosave({ editor, ydoc, intervalMs: 8000, onSave: handleSave });

  const collaboratorsLabel = collaborators.peers.length
    ? `${collaborators.peers.map((item) => item.name).join(", ")} đang hoạt động`
    : "Không có bạn cùng chỉnh sửa";

  return (
    <div className="editor-layout">
      <EditorStatus connectionState={connectionState} collaboratorLabel={collaboratorsLabel} />
      {showToolbar ? <EditorToolbar editor={editor} disabled={!canEdit} /> : null}
      <CursorLayer collaborators={collaborators.peers} />
      <EditorPermissionGuard role={documentData.role}>
        <RichTextEditor documentData={documentData} ydoc={ydoc} awareness={awareness} user={user} editable={canEdit} onEditorReady={setEditor} />
      </EditorPermissionGuard>
      <VersionPanel onCreateVersion={async () => {
        await handleSave();
        sendVersionRequest();
      }} />
    </div>
  );
}

export function DocumentEditor({ documentData, user }: { documentData: DocumentModel; user: User }) {
  const initialState = useMemo(() => ({ documentData, user }), [documentData, user]);
  return (
    <CollaborationProvider documentId={documentData.id} user={user} role={documentData.role}>
      <DocumentEditorContent documentData={initialState.documentData} user={initialState.user} />
    </CollaborationProvider>
  );
}
