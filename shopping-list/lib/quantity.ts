const STEP: Record<string, number> = {
  kg: 0.5,
  grams: 50,
  litre: 0.5,
  ml: 100,
  piece: 1,
  pack: 1,
  dozen: 1,
  bunch: 1,
};

export function stepFor(unit: string): number {
  return STEP[unit] ?? 1;
}

export function formatQty(qty: number, unit: string): string {
  const n = Number.isInteger(qty) ? String(qty) : String(Math.round(qty * 100) / 100);
  return `${n} ${unit}`;
}

export function parseQty(input: string): number | null {
  const n = parseFloat(input.replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}
