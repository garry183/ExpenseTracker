export const colors = {
  bg: '#0E1116',
  surface: '#171B22',
  surfaceAlt: '#1F242D',
  primary: '#4ADE80',
  primaryDark: '#22C55E',
  onPrimary: '#0B1A10',
  text: '#F3F5F7',
  textMuted: '#A0A8B4',
  textFaint: '#6B7380',
  border: '#2A303A',
  danger: '#F87171',
  dangerBg: '#3A1D1D',
  vegetables: '#4ADE80',
  fruits: '#FB923C',
  groceries: '#60A5FA',
  ringTrack: '#2A303A',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export const radii = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

export const typography = {
  h1: { fontSize: 26, fontWeight: '800' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  title: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  label: { fontSize: 13, color: colors.textMuted },
};
