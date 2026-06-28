export function todayISO(): string {
  return toISO(new Date());
}

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function currentMonth(): string {
  return todayISO().slice(0, 7);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function shortMonthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
}

export function dayHeaderLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return 'Today';
  if (iso === addDaysISO(today, -1)) return 'Yesterday';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function daysRemainingInMonth(month: string): number {
  const today = todayISO();
  if (today.slice(0, 7) !== month) {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m, 0).getDate(); // total days if not current month
  }
  const [y, m] = month.split('-').map(Number);
  const total = new Date(y, m, 0).getDate();
  const currentDay = Number(today.slice(8, 10));
  return total - currentDay + 1;
}
