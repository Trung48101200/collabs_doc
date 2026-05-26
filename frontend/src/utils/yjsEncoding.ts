import * as Y from "yjs";
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate as encodeAwarenessUpdateInternal } from "y-protocols/awareness";

export function encodeStateAsBase64(ydoc: Y.Doc) {
  const update = Y.encodeStateAsUpdate(ydoc);
  return uint8ArrayToBase64(update);
}

function uint8ArrayToBase64(array: Uint8Array) {
  let binary = "";
  const len = array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
}

export function decodeBase64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
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
