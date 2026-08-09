import { AnnualExpenseStatus } from '@/types';
import { colors } from '@/constants/theme';

export function annualStatusMeta(status: AnnualExpenseStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'paid':
      return { label: 'Paid', color: colors.income, bg: colors.incomeBg };
    case 'overdue':
      return { label: 'Overdue', color: colors.over, bg: colors.expenseBg };
    case 'dueSoon':
      return { label: 'Due soon', color: colors.warning, bg: '#FFF4DE' };
    case 'upcoming':
    default:
      return { label: 'Upcoming', color: colors.textMuted, bg: colors.surfaceAlt };
  }
}
