import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { RichTextEditor } from "../editor/RichTextEditor.jsx";
import { getDocument, saveDocument, createVersion } from "../services/documentApi.js";
import { useDocumentSocket } from "../hooks/useDocumentSocket.js";
import { encodeStateAsBase64 } from "../utils/yjsEncoding.js";

export function EditorPage({ session, documentId, onBack }) {
  const { user } = session;
  const [documentData, setDocumentData] = useState(null);
  const [editor, setEditor] = useState(null);
  const [saveState, setSaveState] = useState("saved");
  const { socket, ydoc, onlineUsers, connectionState } = useDocumentSocket(documentId, user);

  useEffect(() => {
    getDocument(documentId, user).then(setDocumentData);
  }, [documentId, user]);

  async function handleSave() {
    if (!editor || !documentData) return;
    setSaveState("saving");
    await saveDocument(
      documentId,
      {
        title: documentData.title,
        contentText: editor.getText(),
        contentJson: editor.getJSON(),
        contentHtml: editor.getHTML(),
        ydocState: encodeStateAsBase64(ydoc)
      },
      user
    );
    socket.emit("save-document", { documentId });
    setSaveState("saved");
  }

  async function handleCreateVersion() {
    await handleSave();
    await createVersion(documentId, user);
  }

  if (!documentData) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <button className="button secondary" onClick={onBack}>Quay lai</button>
        </header>
        <section className="page panel">Dang tai tai lieu...</section>
      </main>
    );
  }

  const canEdit = ["owner", "editor"].includes(documentData.role);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="row">
          <button className="button secondary icon" onClick={onBack} title="Quay lai">
            <ArrowLeft size={18} />
          </button>
          <strong>{documentData.title}</strong>
          <span className="muted">{connectionState} - {saveState}</span>
        </div>
        <div className="row">
          {onlineUsers.map((onlineUser) => (
            <span className="user-pill" key={`${onlineUser.id}-${onlineUser.name}`}>
              <span className="dot" style={{ color: onlineUser.color }} />
              {onlineUser.name}
            </span>
          ))}
          <button className="button secondary" onClick={handleCreateVersion}>Tao version</button>
          <button className="button icon" onClick={handleSave} title="Luu">
            <Save size={18} />
          </button>
        </div>
      </header>
      <RichTextEditor
        documentData={documentData}
        ydoc={ydoc}
        user={user}
        editable={canEdit}
        onEditorReady={setEditor}
      />
    </main>
  );
}
