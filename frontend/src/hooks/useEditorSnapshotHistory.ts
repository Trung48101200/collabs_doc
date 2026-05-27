import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Editor, JSONContent } from "@tiptap/react";
import type { Command } from "../history/Command";
import { HistoryManager } from "../history/HistoryManager";

export function useEditorSnapshotHistory(editor: Editor | null, enabled: boolean) {
  const manager = useMemo(() => new HistoryManager(), []);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const lastSnapshotRef = useRef<JSONContent | null>(null);
  const applyingRef = useRef(false);
  const pendingPrevRef = useRef<JSONContent | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncFlags = useCallback(() => {
    setCanUndo(manager.canUndo());
    setCanRedo(manager.canRedo());
  }, [manager]);

  useEffect(() => {
    if (!editor || !enabled) return;
    lastSnapshotRef.current = editor.getJSON();
    syncFlags();

    const onTransaction = ({ transaction }: { transaction: { docChanged: boolean } }) => {
      if (!enabled || applyingRef.current) return;
      if (!transaction.docChanged) return;
      if (!pendingPrevRef.current) {
        pendingPrevRef.current = lastSnapshotRef.current ?? editor.getJSON();
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const previous = pendingPrevRef.current ?? lastSnapshotRef.current ?? editor.getJSON();
        const next = editor.getJSON();
        pendingPrevRef.current = null;
        if (JSON.stringify(previous) === JSON.stringify(next)) {
          return;
        }

        const command: Command = {
          execute: () => {
            applyingRef.current = true;
            editor.commands.setContent(next, false);
            applyingRef.current = false;
          },
          undo: () => {
            applyingRef.current = true;
            editor.commands.setContent(previous, false);
            applyingRef.current = false;
          }
        };

        manager.recordExecuted(command);
        lastSnapshotRef.current = next;
        syncFlags();
      }, 220);
    };

    editor.on("transaction", onTransaction as any);
    return () => {
      editor.off("transaction", onTransaction as any);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [editor, enabled, manager, syncFlags]);

  useEffect(() => {
    if (enabled) return;
    pendingPrevRef.current = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCanUndo(false);
    setCanRedo(false);
  }, [enabled]);

  const undo = useCallback(() => {
    if (!enabled || !manager.canUndo()) return;
    manager.undo();
    if (editor) lastSnapshotRef.current = editor.getJSON();
    syncFlags();
  }, [enabled, manager, editor, syncFlags]);

  const redo = useCallback(() => {
    if (!enabled || !manager.canRedo()) return;
    manager.redo();
    if (editor) lastSnapshotRef.current = editor.getJSON();
    syncFlags();
  }, [enabled, manager, editor, syncFlags]);

  return { canUndo, canRedo, undo, redo };
}

