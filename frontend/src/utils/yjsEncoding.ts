import * as Y from "yjs";
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate as encodeAwarenessUpdateInternal } from "y-protocols/awareness";

export function encodeStateAsBase64(ydoc: Y.Doc) {
  const update = Y.encodeStateAsUpdate(ydoc);
  const bytes = Array.from(update);
  return btoa(String.fromCharCode(...bytes));
}

export function applyUpdateArray(ydoc: Y.Doc, update: number[]) {
  Y.applyUpdate(ydoc, Uint8Array.from(update), "remote");
}

export function encodeAwarenessUpdate(awareness: Awareness, clients: number[]) {
  const update = encodeAwarenessUpdateInternal(awareness, clients);
  return Array.from(update);
}

export function applyAwarenessUpdateBytes(awareness: Awareness, update: number[]) {
  applyAwarenessUpdate(awareness, Uint8Array.from(update), "remote");
}
