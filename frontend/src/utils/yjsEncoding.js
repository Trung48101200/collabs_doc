import * as Y from "yjs";

export function encodeStateAsBase64(ydoc) {
  const update = Y.encodeStateAsUpdate(ydoc);
  const bytes = Array.from(update);
  return btoa(String.fromCharCode(...bytes));
}

export function applyUpdateArray(ydoc, update) {
  Y.applyUpdate(ydoc, Uint8Array.from(update), "remote");
}
