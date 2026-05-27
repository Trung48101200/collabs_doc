import { useCallback, useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { CollaborationProvider, useCollaboration } from "./CollaborationProvider";
import { EditorToolbar } from "./EditorToolbar";
import { RichTextEditor } from "./RichTextEditor";
import { VersionPanel } from "./VersionPanel";
import { EditorPermissionGuard } from "./EditorPermissionGuard";
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
  onPresenceChange?: (users: User[]) => void;
}

function DocumentEditorContent({ documentData, user, isVersionOpen, onCloseVersions, onPresenceChange }: DocumentEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const collaboration = useCollaboration();
  const { ydoc, awareness, onlineUsers, remoteCursors, writeBlocked, sendCursorUpdate, sendSaveRequest, applyYdocState } = collaboration;
  const { canEdit: roleCanEdit, showToolbar: roleShowToolbar } = usePermission(documentData.role);
  const canEdit = roleCanEdit && !writeBlocked;
  const showToolbar = roleShowToolbar && !writeBlocked;
  const collaborators = useCollaborators(onlineUsers, user.id);

  const handleSave = useCallback(async () => {
    if (!editor) return;
    await saveDocument(documentData.id, {
      contentText: editor.getText(),
      contentJson: editor.getJSON(),
      contentHtml: editor.getHTML(),
      ydocState: encodeStateAsBase64(ydoc)
    }, user);
    sendSaveRequest();
  }, [documentData.id, editor, sendSaveRequest, user, ydoc]);

  useEditorSync(editor, ydoc, canEdit);
  useAutosave({ editor, ydoc, intervalMs: 8000, onSave: handleSave });

  useEffect(() => {
    if (onPresenceChange) {
      onPresenceChange(collaborators.allUsers);
    }
  }, [collaborators.allUsers, onPresenceChange]);

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
      {showToolbar ? (
        <EditorToolbar
          editor={editor}
          disabled={!canEdit}
        />
      ) : null}
      <EditorPermissionGuard role={documentData.role}>
        <RichTextEditor
          documentData={documentData}
          ydoc={ydoc}
          awareness={awareness}
          user={user}
          editable={canEdit}
          onEditorReady={setEditor}
          onCursorChange={sendCursorUpdate}
          remoteCursors={remoteCursors}
          onlineUsers={onlineUsers}
        />
      </EditorPermissionGuard>
      <VersionPanel
        documentId={documentData.id}
        user={user}
        canEdit={canEdit}
        isOpen={isVersionOpen}
        onClose={onCloseVersions}
        onBeforeCreateVersion={handleSave}
        onRestored={(restoredDocument) => {
          console.log("[restore] onRestored callback", {
            documentId: documentData.id,
            hasYdocState: Boolean(restoredDocument.ydocState),
            hasContentJson: Boolean(restoredDocument.contentJson),
            htmlLength: restoredDocument.contentHtml?.length || 0
          });
          if (restoredDocument.ydocState) {
            console.log("[restore] Apply ydocState directly");
            applyYdocState(restoredDocument.ydocState);
          } else if (editor) {
            console.warn("[restore] Missing ydocState, fallback setContent");
            if (restoredDocument.contentJson) {
              editor.commands.setContent(restoredDocument.contentJson as any, false);
            } else if (restoredDocument.contentHtml) {
              editor.commands.setContent(restoredDocument.contentHtml, false);
            } else {
              editor.commands.clearContent(false);
            }
          }

          if (editor) {
            requestAnimationFrame(() => {
              const currentText = editor.getText().trim();
              const restoredText = (restoredDocument.contentText || "").trim();
              if (currentText !== restoredText) {
                console.warn("[restore] Reconcile editor content after ydoc apply", {
                  currentTextLength: currentText.length,
                  restoredTextLength: restoredText.length
                });
                if (restoredDocument.contentJson) {
                  editor.commands.setContent(restoredDocument.contentJson as any, false);
                } else if (restoredDocument.contentHtml) {
                  editor.commands.setContent(restoredDocument.contentHtml, false);
                } else {
                  editor.commands.clearContent(false);
                }
              }
            });
          }
        }}
      />
    </div>
  );
}

export function DocumentEditor({ documentData, user, isVersionOpen, onCloseVersions, onPresenceChange }: DocumentEditorProps) {
  const initialState = useMemo(() => ({ documentData, user }), [documentData, user]);
  return (
    <CollaborationProvider documentId={documentData.id} user={user} role={documentData.role} initialYdocState={documentData.ydocState}>
      <DocumentEditorContent
        documentData={initialState.documentData}
        user={initialState.user}
        isVersionOpen={isVersionOpen}
        onCloseVersions={onCloseVersions}
        onPresenceChange={onPresenceChange}
      />
    </CollaborationProvider>
  );
}
