import { useEffect } from "react";
import * as Y from "yjs";
import type { Editor } from "@tiptap/react";

interface UseAutosaveOptions {
  editor: Editor | null;
  ydoc: Y.Doc;
  intervalMs?: number;
  onSave: () => Promise<void>;
}

export function useAutosave({ editor, ydoc, intervalMs = 8000, onSave }: UseAutosaveOptions) {
  useEffect(() => {
    if (!editor) return undefined;

    const timer = window.setInterval(() => {
      if (!editor.isFocused && ydoc) {
        onSave().catch(() => {
          // swallow save error, user can retry from UI
        });
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [editor, ydoc, intervalMs, onSave]);
}
