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
import { EditorToolbar } from "./EditorToolbar.jsx";

export function RichTextEditor({ documentData, ydoc, user, editable, onEditorReady }) {
  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        history: false
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      Collaboration.configure({
        document: ydoc
      })
    ],
    content: documentData.contentJson || {
      type: "doc",
      content: [{ type: "paragraph" }]
    }
  });

  useEffect(() => {
    if (editor) onEditorReady(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  return (
    <section className="editor-layout">
      <EditorToolbar editor={editor} disabled={!editable} />
      <div className="editor-surface">
        <article className="editor-paper">
          <EditorContent editor={editor} />
        </article>
      </div>
    </section>
  );
}
