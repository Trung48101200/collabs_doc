import { useEffect } from "react";
import type { Editor } from "@tiptap/react";
import * as Y from "yjs";

export function useEditorSync(editor: Editor | null, ydoc: Y.Doc, editable: boolean) {
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);

    // Synchronize editor with ydoc if needed, 
    // but avoid stealing focus on every update.
  }, [editor, ydoc, editable]);
}
