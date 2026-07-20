import { Recurrence, DoTodo } from '../types';

export function getNextDueDate(todo: DoTodo): number | undefined {
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
      if (r.weekdays && r.weekdays.length > 0) {
        return getNextWeekdayDate(current, r.weekdays);
      }
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

function getNextWeekdayDate(from: Date, weekdays: number[]): number {
  const sorted = [...weekdays].sort((a, b) => a - b);
  const currentDay = from.getDay();

  for (const day of sorted) {
    if (day > currentDay) {
      const next = new Date(from);
      next.setDate(next.getDate() + (day - currentDay));
      return next.getTime();
    }
  }

  const next = new Date(from);
  const daysUntilNextWeek = 7 - currentDay + sorted[0];
  next.setDate(next.getDate() + daysUntilNextWeek);
  return next.getTime();
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatRecurrenceSummary(r: Recurrence): string {
  const frequencyLabels: Record<Recurrence['frequency'], string> = {
    daily: 'Daily',
    weekdays: 'Weekdays',
    weekly: 'Weekly',
    biweekly: 'Biweekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };

  let label = frequencyLabels[r.frequency];

  if (r.interval > 1 && r.frequency !== 'weekdays') {
    const unit = r.frequency === 'daily' ? 'day'
      : r.frequency === 'weekly' ? 'week'
      : r.frequency === 'biweekly' ? '2 weeks'
      : r.frequency === 'monthly' ? 'month'
      : r.frequency === 'yearly' ? 'year'
      : r.frequency;
    label = `Every ${r.interval} ${unit}s`;
  }

  if (r.frequency === 'weekly' && r.weekdays && r.weekdays.length > 0) {
    const sorted = [...r.weekdays].sort((a, b) => a - b);
    const dayNames = sorted.map(d => DAY_LABELS[d]);
    if (dayNames.length === 1) {
      label = `Every ${dayNames[0]}`;
    } else if (dayNames.length <= 3) {
      label = `Every ${dayNames.join(', ')}`;
    } else if (dayNames.length === 5 && sorted.join(',') === '1,2,3,4,5') {
      label = 'Weekdays';
    } else {
      label = `${dayNames.length} days/week`;
    }
  }

  if (r.endType === 'until' && r.endDate !== undefined) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(r.endDate);
    label += ` · until ${months[d.getMonth()]} ${d.getDate()}`;
  }

  return label;
}

/**
 * Compute the next occurrence strictly after `from` for a recurrence anchored at
 * `recurrence.originDate`. Returns null if the recurrence has ended (endType
 * 'until' and the computed occurrence is past endDate) or cannot be computed.
 * Unlike getNextDueDate, this does not require a separate dueDate — it derives
 * the schedule purely from originDate, which is what templates use.
 */
export function getNextOccurrence(recurrence: Recurrence, from: number): number | null {
  const origin = recurrence.originDate;
  let cursor = new Date(origin);
  const start = new Date(from);

  const step = (): Date | null => {
    const base = new Date(cursor);
    switch (recurrence.frequency) {
      case 'daily': {
        base.setDate(base.getDate() + recurrence.interval);
        return base;
      }
      case 'weekdays': {
        do {
          base.setDate(base.getDate() + 1);
        } while (base.getDay() === 0 || base.getDay() === 6);
        return base;
      }
      case 'weekly': {
        if (recurrence.weekdays && recurrence.weekdays.length > 0) {
          return new Date(getNextWeekdayDate(base, recurrence.weekdays));
        }
        base.setDate(base.getDate() + 7 * recurrence.interval);
        return base;
      }
      case 'biweekly': {
        base.setDate(base.getDate() + 14 * recurrence.interval);
        return base;
      }
      case 'monthly': {
        base.setMonth(base.getMonth() + recurrence.interval);
        const targetDay = recurrence.dayOfMonth ?? base.getDate();
        const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
        base.setDate(Math.min(targetDay, daysInMonth));
        return base;
      }
      case 'yearly': {
        base.setFullYear(base.getFullYear() + recurrence.interval);
        return base;
      }
      default:
        return null;
    }
  };

  // Walk forward from origin until we pass `from`.
  let next = step();
  while (next && next.getTime() <= start.getTime()) {
    cursor = next;
    next = step();
  }

  if (!next) return null;

  if (recurrence.endType === 'until' && recurrence.endDate !== undefined) {
    if (next.getTime() > recurrence.endDate) return null;
  }

  return next.getTime();
}
