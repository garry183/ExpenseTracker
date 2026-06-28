export const CURRENCY = '₹';

export const colors = {
  bg: '#F6F0FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F2ECFB',
  primary: '#6750A4',
  primaryDark: '#4F378B',
  onPrimary: '#FFFFFF',
  text: '#1C1B1F',
  textMuted: '#79747E',
  textFaint: '#9E9E9E',
  border: '#E7E0EC',
  income: '#2E7D32',
  incomeBg: '#E8F5E9',
  expense: '#C62828',
  expenseBg: '#FFEBEE',
  warning: '#F9A825',
  over: '#C62828',
  keypad: '#FFFFFF',
  keypadText: '#1C1B1F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  title: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 14, color: colors.text },
  label: { fontSize: 12, color: colors.textMuted },
  amount: { fontSize: 32, fontWeight: '800' as const, color: colors.text },
};

export function formatAmount(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY}${formatted}`;
}
