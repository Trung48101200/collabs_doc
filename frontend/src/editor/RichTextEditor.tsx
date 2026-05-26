import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import type { DocumentModel, User } from "../types";
import type { Awareness } from "y-protocols/awareness";
import type { Editor } from "@tiptap/react";

interface RichTextEditorProps {
  documentData: DocumentModel;
  ydoc: import("yjs").Doc;
  awareness: Awareness;
  user: User;
  editable: boolean;
  onEditorReady: (editor: Editor) => void;
}

export function RichTextEditor({ documentData, ydoc, awareness, user, editable, onEditorReady }: RichTextEditorProps) {
  const collaborationExtensions = [
    Collaboration.configure({ document: ydoc })
  ];

  if (awareness && typeof awareness.setLocalStateField === "function") {
    collaborationExtensions.push(
      CollaborationCursor.configure({
        provider: { awareness },
        user: { id: user.id, name: user.name, color: user.color }
      })
    );
  }

  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({ history: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ...collaborationExtensions
    ],
    content: documentData.contentJson || {
      type: "doc",
      content: [{ type: "paragraph" }]
    },
    editorProps: {
      attributes: {
        class: "editor-content"
      }
    }
  });

  useEffect(() => {
    if (editor && documentData.contentJson) {
      editor.commands.setContent(documentData.contentJson);
    }
  }, [editor, documentData.contentJson]);

  useEffect(() => {
    if (editor) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  if (!editor) {
    return (
      <section className="editor-surface">
        <article className="editor-paper">
          <div className="editor-loading">Đang khởi tạo trình soạn thảo...</div>
        </article>
      </section>
    );
  }

  return (
    <section className="editor-surface">
      <article className="editor-paper">
        <EditorContent editor={editor} />
      </article>
    </section>
  );
}
