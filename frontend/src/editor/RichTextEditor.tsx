import { useEffect, useMemo } from "react";
import * as Y from "yjs";
import { Extension } from "@tiptap/core";
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

const EditorKeyboardShortcuts = Extension.create({
  name: "editorKeyboardShortcuts",

  addKeyboardShortcuts() {
    const runEditableCommand = (command: () => boolean) => {
      if (!this.editor.isEditable) return false;
      return command();
    };

    return {
      "Mod-a": () => this.editor.chain().focus().selectAll().run(),
      "Mod-b": () => runEditableCommand(() => this.editor.chain().focus().toggleBold().run()),
      "Mod-i": () => runEditableCommand(() => this.editor.chain().focus().toggleItalic().run()),
      "Mod-u": () => runEditableCommand(() => this.editor.chain().focus().toggleUnderline().run()),
      "Mod-k": () => runEditableCommand(() => {
        const previousUrl = this.editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Nhap URL", previousUrl || "https://");
        if (url === null) return true;
        if (url === "") {
          return this.editor.chain().focus().extendMarkRange("link").unsetLink().run();
        }
        return this.editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }),
      "Mod-Alt-0": () => runEditableCommand(() => this.editor.chain().focus().setParagraph().run()),
      "Mod-Alt-1": () => runEditableCommand(() => this.editor.chain().focus().toggleHeading({ level: 1 }).run()),
      "Mod-Alt-2": () => runEditableCommand(() => this.editor.chain().focus().toggleHeading({ level: 2 }).run()),
      "Mod-Alt-3": () => runEditableCommand(() => this.editor.chain().focus().toggleHeading({ level: 3 }).run())
    };
  }
});

interface RichTextEditorProps {
  documentData: DocumentModel;
  ydoc: Y.Doc;
  awareness: Awareness;
  user: User;
  editable: boolean;
  onEditorReady: (editor: Editor) => void;
}

export function RichTextEditor({ documentData, ydoc, awareness, user, editable, onEditorReady }: RichTextEditorProps) {
  const extensions = useMemo(() => {
    return [
      StarterKit.configure({ history: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({
        provider: { awareness },
        user: { id: user.id, name: user.name, color: user.color }
      }),
      EditorKeyboardShortcuts
    ];
  }, [ydoc, awareness, user.id, user.name, user.color]);

  const editor = useEditor({
    editable,
    extensions,
    editorProps: {
      attributes: {
        class: "editor-content"
      }
    }
  }, [extensions]);

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
