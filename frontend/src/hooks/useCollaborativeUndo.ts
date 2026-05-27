import { useCallback, useEffect, useMemo, useState } from "react";
import * as Y from "yjs";

const UNDO_SCOPE_KEYS = ["default", "prosemirror"] as const;

export function useCollaborativeUndo(ydoc: Y.Doc) {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const undoManager = useMemo(() => {
    const scopes = UNDO_SCOPE_KEYS.map((key) => ydoc.getXmlFragment(key));
    return new Y.UndoManager(scopes, { captureTimeout: 500 });
  }, [ydoc]);

  useEffect(() => {
    const sync = () => {
      setCanUndo(undoManager.canUndo());
      setCanRedo(undoManager.canRedo());
    };

    sync();
    undoManager.on("stack-item-added", sync);
    undoManager.on("stack-item-popped", sync);
    undoManager.on("stack-cleared", sync);

    return () => {
      undoManager.off("stack-item-added", sync);
      undoManager.off("stack-item-popped", sync);
      undoManager.off("stack-cleared", sync);
      undoManager.destroy();
    };
  }, [undoManager]);

  const undo = useCallback(() => {
    if (!undoManager.canUndo()) return;
    undoManager.undo();
    setCanUndo(undoManager.canUndo());
    setCanRedo(undoManager.canRedo());
  }, [undoManager]);

  const redo = useCallback(() => {
    if (!undoManager.canRedo()) return;
    undoManager.redo();
    setCanUndo(undoManager.canUndo());
    setCanRedo(undoManager.canRedo());
  }, [undoManager]);

  useEffect(() => {
    const sync = () => {
      setCanUndo(undoManager.canUndo());
      setCanRedo(undoManager.canRedo());
    };
    ydoc.on("update", sync);
    return () => ydoc.off("update", sync);
  }, [ydoc, undoManager]);

  return { canUndo, canRedo, undo, redo };
}
