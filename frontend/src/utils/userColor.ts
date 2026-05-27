const PALETTE = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#0891b2",
  "#16a34a",
  "#ca8a04",
  "#dc2626"
];

export function getUserColor(userId: number) {
  const normalized = Number.isFinite(userId) ? Math.abs(Math.trunc(userId)) : 0;
  return PALETTE[normalized % PALETTE.length];
}
