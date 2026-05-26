import { useEffect } from "react";
import type { Editor } from "@tiptap/react";
import * as Y from "yjs";

export function useEditorSync(editor: Editor | null, ydoc: Y.Doc, editable: boolean) {
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
    const handleUpdate = () => {
      if (editor && ydoc) {
        editor.commands.focus();
      }
    };

    ydoc.on("update", handleUpdate);
    return () => {
      ydoc.off("update", handleUpdate);
    };
  }, [editor, ydoc, editable]);
}
