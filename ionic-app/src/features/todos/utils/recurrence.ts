import { Recurrence, Todo } from '../types';

export function getNextDueDate(todo: Todo): number | undefined {
  if (!todo.recurrence || !todo.dueDate) return undefined;

  const r = todo.recurrence;
  const current = new Date(todo.dueDate);

  switch (r.frequency) {
    case 'daily': {
      const next = new Date(current);
      next.setDate(next.getDate() + r.interval);
      return next.getTime();
    }
    case 'weekdays': {
      const next = new Date(current);
      do {
        next.setDate(next.getDate() + 1);
      } while (next.getDay() === 0 || next.getDay() === 6);
      return next.getTime();
    }
    case 'weekly': {
      const next = new Date(current);
      next.setDate(next.getDate() + 7 * r.interval);
      return next.getTime();
    }
    case 'biweekly': {
      const next = new Date(current);
      next.setDate(next.getDate() + 14 * r.interval);
      return next.getTime();
    }
    case 'monthly': {
      const next = new Date(current);
      next.setMonth(next.getMonth() + 1 * r.interval);
      const targetDay = r.dayOfMonth ?? current.getDate();
      const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      if (daysInMonth < targetDay) {
        next.setDate(daysInMonth);
      } else {
        next.setDate(targetDay);
      }
      return next.getTime();
    }
    case 'yearly': {
      const next = new Date(current);
      next.setFullYear(next.getFullYear() + 1 * r.interval);
      return next.getTime();
    }
    default:
      return undefined;
  }
}

export function formatRecurrenceSummary(r: Recurrence): string {
  const labels: Record<Recurrence['frequency'], string> = {
    daily: 'Daily',
    weekdays: 'Weekdays',
    weekly: 'Weekly',
    biweekly: 'Biweekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };

  let label = labels[r.frequency];

  if (r.endType === 'after' && r.endCount !== undefined && r.endCount > 0) {
    label += ` · ${r.endCount} left`;
  }

  return label;
}
