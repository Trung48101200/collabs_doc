import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
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
import { createEditorKeyboardShortcuts } from "./editorKeyboardShortcuts";
import type { DocumentModel, User } from "../types";
import type { Awareness } from "y-protocols/awareness";
import type { Editor } from "@tiptap/react";

interface RichTextEditorProps {
  documentData: DocumentModel;
  ydoc: Y.Doc;
  awareness: Awareness;
  user: User;
  editable: boolean;
  onEditorReady: (editor: Editor) => void;
  onCursorChange?: (cursor: { from: number; to: number }) => void;
  remoteCursors?: Record<number, { from: number; to: number }>;
  onlineUsers?: User[];
}

export function RichTextEditor({
  documentData,
  ydoc,
  awareness,
  user,
  editable,
  onEditorReady,
  onCursorChange,
  remoteCursors = {},
  onlineUsers = []
}: RichTextEditorProps) {
  const [cursorMarkers, setCursorMarkers] = useState<Array<{ userId: number; name: string; color: string; top: number; left: number }>>([]);
  const cursorProvider = useMemo(() => {
    return {
      awareness,
      on: (event: string, callback: (...args: unknown[]) => void) => {
        if (event === "awarenessUpdate" || event === "update") {
          awareness.on("update", callback as any);
        }
      },
      off: (event: string, callback: (...args: unknown[]) => void) => {
        if (event === "awarenessUpdate" || event === "update") {
          awareness.off("update", callback as any);
        }
      }
    };
  }, [awareness]);

  const extensions = useMemo(() => {
    return [
      StarterKit.configure({ history: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Collaboration.configure({ document: ydoc, field: "default", provider: cursorProvider as any }),
      CollaborationCursor.configure({
        provider: cursorProvider as any,
        user: { id: user.id, name: user.name, color: user.color },
        render: (remoteUser) => {
          const caret = document.createElement("span");
          caret.classList.add("collaboration-cursor__caret");
          caret.style.borderColor = remoteUser.color || "#2563eb";

          const label = document.createElement("div");
          label.classList.add("collaboration-cursor__label");
          label.style.backgroundColor = remoteUser.color || "#2563eb";
          label.textContent = remoteUser.name || "User";

          caret.appendChild(label);
          return caret;
        }
      }),
      createEditorKeyboardShortcuts()
    ];
  }, [ydoc, cursorProvider, user.id, user.name, user.color]);

  const editor = useEditor({
    editable,
    extensions,
    editorProps: {
      attributes: {
        class: "editor-content tiptap"
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

  useEffect(() => {
    if (!editor || !onCursorChange) return;
    const emitCursor = () => {
      const { from, to } = editor.state.selection;
      onCursorChange({ from, to });
    };

    editor.on("selectionUpdate", emitCursor);
    editor.on("focus", emitCursor);
    return () => {
      editor.off("selectionUpdate", emitCursor);
      editor.off("focus", emitCursor);
    };
  }, [editor, onCursorChange]);

  useEffect(() => {
    if (!editor) return;
    const entries = Object.entries(remoteCursors);
    if (entries.length === 0) {
      setCursorMarkers([]);
      return;
    }

    const paperElement = editor.view.dom.closest(".editor-paper") as HTMLElement | null;
    const paperRect = paperElement?.getBoundingClientRect() || editor.view.dom.getBoundingClientRect();
    const markers = entries
      .map(([key, cursor]) => {
        const userId = Number(key);
        const peer = onlineUsers.find((item) => item.id === userId);
        if (!peer) return null;
        try {
          const maxPos = Math.max(1, editor.state.doc.content.size);
          const pos = Math.min(Math.max(cursor.from, 1), maxPos);
          const coords = editor.view.coordsAtPos(pos);
          return {
            userId,
            name: peer.name || `User ${userId}`,
            color: peer.color || "#2563eb",
            top: coords.top - paperRect.top,
            left: coords.left - paperRect.left
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Array<{ userId: number; name: string; color: string; top: number; left: number }>;

    setCursorMarkers(markers);
  }, [editor, onlineUsers, remoteCursors]);

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
        {cursorMarkers.map((marker) => (
          <div
            key={marker.userId}
            style={{
              position: "absolute",
              top: marker.top,
              left: marker.left,
              width: 2,
              height: "1.4em",
              backgroundColor: marker.color,
              pointerEvents: "none",
              zIndex: 15
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "-1.5em",
                left: 0,
                transform: "translateX(-1px)",
                backgroundColor: marker.color,
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1.2,
                borderRadius: "4px 4px 4px 0",
                padding: "2px 6px",
                whiteSpace: "nowrap"
              }}
            >
              {marker.name}
            </span>
          </div>
        ))}
        <EditorContent editor={editor} />
      </article>
    </section>
  );
}
