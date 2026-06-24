import { memo, useCallback, useMemo, useState } from 'react';
import { IonButton, IonChip, IonIcon, IonLabel, IonPopover, IonSelect, IonSelectOption, IonText, IonToggle, IonDatetime } from '@ionic/react';
import { closeOutline, calendarOutline, removeOutline, addOutline, repeatOutline } from 'ionicons/icons';
import { Recurrence } from '../types';
import { formatRecurrenceSummary } from '../utils/recurrence';

interface RepeatSectionProps {
  value?: Recurrence
  dueDate?: number
  onChange: (recurrence: Recurrence | undefined) => void
}

const FREQUENCIES = [
  { value: 'daily' as const, label: 'Daily' },
  { value: 'weekdays' as const, label: 'Weekdays' },
  { value: 'weekly' as const, label: 'Weekly' },
  { value: 'monthly' as const, label: 'Monthly' },
  { value: 'yearly' as const, label: 'Yearly' },
];

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CUSTOM_UNITS = [
  { value: 'daily' as const, label: 'Days' },
  { value: 'weekly' as const, label: 'Weeks' },
  { value: 'monthly' as const, label: 'Months' },
  { value: 'yearly' as const, label: 'Years' },
];

const MAX_INTERVAL = 99;

function getDefaultWeekday(dueDate?: number): number {
  if (dueDate) return new Date(dueDate).getDay();
  return new Date().getDay();
}

export const RepeatSection = memo(function RepeatSection({
  value,
  dueDate,
  onChange,
}: RepeatSectionProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customUnit, setCustomUnit] = useState<Recurrence['frequency']>('weekly');
  const [customInterval, setCustomInterval] = useState(2);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);

  const openEndCalendar = useCallback(() => {
    setIsEndCalendarOpen(true);
  }, []);

  const handleEndCalendarDismiss = useCallback(() => {
    setIsEndCalendarOpen(false);
  }, []);

  const isCustomActive = customMode && value != null;

  const handleFrequencyClick = useCallback((freq: Recurrence['frequency']) => {
    if (value?.frequency === freq && !customMode) {
      onChange(undefined);
      return;
    }

    setCustomMode(false);

    if (freq === 'weekly') {
      const defaultDay = getDefaultWeekday(dueDate);
      onChange({
        frequency: 'weekly',
        interval: 1,
        weekdays: [defaultDay],
        endType: value?.endType ?? 'never',
        endDate: value?.endType === 'until' ? value.endDate : undefined,
        originDate: dueDate ?? Date.now(),
      });
      return;
    }

    onChange({
      frequency: freq,
      interval: 1,
      dayOfMonth: freq === 'monthly' && dueDate ? new Date(dueDate).getDate() : undefined,
      endType: value?.endType ?? 'never',
      endDate: value?.endType === 'until' ? value.endDate : undefined,
      originDate: dueDate ?? Date.now(),
    });
  }, [value, dueDate, onChange, customMode]);

  const handleCustomClick = useCallback(() => {
    if (isCustomActive) {
      onChange(undefined);
      setCustomMode(false);
      return;
    }
    setCustomMode(true);
    onChange({
      frequency: customUnit,
      interval: customInterval,
      dayOfMonth: customUnit === 'monthly' && dueDate ? new Date(dueDate).getDate() : undefined,
      endType: value?.endType ?? 'never',
      endDate: value?.endType === 'until' ? value.endDate : undefined,
      originDate: dueDate ?? Date.now(),
    });
  }, [isCustomActive, customUnit, customInterval, dueDate, value, onChange]);

  const handleWeekdayToggle = useCallback((day: number) => {
    if (!value || value.frequency !== 'weekly') return;
    const current = value.weekdays ?? [getDefaultWeekday(dueDate)];
    const next = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort((a, b) => a - b);
    if (next.length === 0) return;
    onChange({ ...value, weekdays: next });
  }, [value, dueDate, onChange]);

  const handleCustomUnitChange = useCallback((unit: Recurrence['frequency']) => {
    setCustomUnit(unit);
    if (isCustomActive) {
      onChange({
        ...value!,
        frequency: unit,
        interval: customInterval,
        dayOfMonth: unit === 'monthly' && dueDate ? new Date(dueDate).getDate() : undefined,
      });
    }
  }, [isCustomActive, value, customInterval, dueDate, onChange]);

  const handleIntervalChange = useCallback((delta: number) => {
    const next = Math.min(MAX_INTERVAL, Math.max(1, customInterval + delta));
    setCustomInterval(next);
    if (isCustomActive) {
      onChange({ ...value!, interval: next });
    }
  }, [customInterval, isCustomActive, value, onChange]);

  function getDefaultEndDate(): number {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.getTime();
  }

  function formatDate(ts: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(ts);
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  const handleToggleChange = useCallback((e: CustomEvent) => {
    if (!value) return;
    const isOn = e.detail.checked;
    onChange({
      ...value,
      endType: isOn ? 'until' : 'never',
      endDate: isOn ? (value.endDate ?? getDefaultEndDate()) : undefined,
    });
  }, [value, onChange]);

  const handleEndDateChange = useCallback((e: CustomEvent) => {
    if (!value) return;
    const isoStr = e.detail.value as string | undefined;
    if (!isoStr) {
      setIsEndCalendarOpen(false);
      return;
    }
    const datePart = isoStr.split('T')[0];
    const [y, m, d] = datePart.split('-').map(Number);
    const timestamp = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
    if (Number.isFinite(timestamp)) {
      onChange({ ...value, endDate: timestamp });
    }
    setIsEndCalendarOpen(false);
  }, [value, onChange]);

  const todayIsoString = new Date().toISOString().split('T')[0];

  function getEndDateValue(ts?: number): string {
    const d = ts ? new Date(ts) : new Date();
    if (!ts) d.setMonth(d.getMonth() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const handleRemove = useCallback(() => {
    setCustomMode(false);
    onChange(undefined);
  }, [onChange]);

  const nextOccurrence = useMemo(() => {
    if (!value || !dueDate) return null;
    const temp: Recurrence = { ...value, originDate: dueDate };
    const now = new Date(dueDate);
    let next: Date | undefined;

    switch (temp.frequency) {
      case 'daily':
        next = new Date(now);
        next.setDate(next.getDate() + temp.interval);
        break;
      case 'weekdays': {
        next = new Date(now);
        do { next.setDate(next.getDate() + 1); } while (next.getDay() === 0 || next.getDay() === 6);
        break;
      }
      case 'weekly': {
        if (temp.weekdays && temp.weekdays.length > 0) {
          const sorted = [...temp.weekdays].sort((a, b) => a - b);
          const currentDay = now.getDay();
          let found = false;
          for (const day of sorted) {
            if (day > currentDay) {
              next = new Date(now);
              next.setDate(next.getDate() + (day - currentDay));
              found = true;
              break;
            }
          }
          if (!found) {
            next = new Date(now);
            next.setDate(next.getDate() + (7 - currentDay + sorted[0]));
          }
        } else {
          next = new Date(now);
          next.setDate(next.getDate() + 7 * temp.interval);
        }
        break;
      }
      case 'biweekly':
        next = new Date(now);
        next.setDate(next.getDate() + 14 * temp.interval);
        break;
      case 'monthly': {
        next = new Date(now);
        next.setMonth(next.getMonth() + temp.interval);
        const targetDay = temp.dayOfMonth ?? now.getDate();
        const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(Math.min(targetDay, daysInMonth));
        break;
      }
      case 'yearly':
        next = new Date(now);
        next.setFullYear(next.getFullYear() + temp.interval);
        break;
    }
    return next;
  }, [value, dueDate]);

  const formatPreview = (d: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[d.getDay()];
    const monthName = months[d.getMonth()];
    return `${dayName}, ${monthName} ${d.getDate()}`;
  };

  return (
    <section className="edit-section edit-section--repeat">
      <div className="edit-section-heading">
        <h2 className="edit-section-title">
          <IonIcon icon={repeatOutline} />
          <span>Repeat</span>
        </h2>
        {value && (
          <div className="edit-section-meta">
            <IonChip color="primary" outline className="repeat-summary-chip">
              {formatRecurrenceSummary(value)}
            </IonChip>
          </div>
        )}
      </div>

      <div className="repeat-frequency-grid">
        {FREQUENCIES.map((f) => (
          <IonChip
            key={f.value}
            className={`repeat-chip${value?.frequency === f.value && !customMode ? ' is-active' : ''}`}
            outline={!(value?.frequency === f.value && !customMode)}
            color={value?.frequency === f.value && !customMode ? 'primary' : undefined}
            onClick={() => handleFrequencyClick(f.value)}
          >
            {f.label}
          </IonChip>
        ))}
        <IonChip
          className={`repeat-chip${customMode ? ' is-active' : ''}`}
          outline={!customMode}
          color={customMode ? 'primary' : undefined}
          onClick={handleCustomClick}
        >
          Custom
        </IonChip>
      </div>

      {value?.frequency === 'weekly' && !customMode && (
        <div className="repeat-weekday-picker">
          {WEEKDAY_LABELS.map((label, i) => {
            const selected = value.weekdays?.includes(i) ?? false;
            return (
              <IonChip
                key={i}
                className={`repeat-weekday${selected ? ' is-active' : ''}`}
                outline={!selected}
                color={selected ? 'primary' : undefined}
                onClick={() => handleWeekdayToggle(i)}
                aria-label={WEEKDAY_FULL[i]}
              >
                {label}
              </IonChip>
            );
          })}
        </div>
      )}

      {isCustomActive && (
        <div className="repeat-custom-panel">
          <div className="repeat-custom-row">
            <IonLabel color="medium">Every</IonLabel>
            <div className="repeat-interval-stepper">
              <IonButton
                fill="clear"
                size="small"
                onClick={() => handleIntervalChange(-1)}
                disabled={customInterval <= 1}
                aria-label="Decrease interval"
              >
                <IonIcon icon={removeOutline} slot="icon-only" />
              </IonButton>
              <span className="repeat-interval-value">{customInterval}</span>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => handleIntervalChange(1)}
                disabled={customInterval >= MAX_INTERVAL}
                aria-label="Increase interval"
              >
                <IonIcon icon={addOutline} slot="icon-only" />
              </IonButton>
            </div>
            <div className="repeat-custom-unit">
              <IonSelect
                className="repeat-unit-select"
                value={customUnit}
                onIonChange={(e) => handleCustomUnitChange(e.detail.value as Recurrence['frequency'])}
                interface="action-sheet"
              >
                {CUSTOM_UNITS.map(u => (
                  <IonSelectOption key={u.value} value={u.value}>{u.label}</IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>
        </div>
      )}

      {value && (
        <div className="repeat-end-section">
          <div className="repeat-end-toggle-row">
            <IonLabel>Repeat until date</IonLabel>
            <IonToggle
              checked={value.endType === 'until'}
              onIonChange={handleToggleChange}
            />
          </div>
          {value.endType === 'until' && (
            <div className="repeat-end-date-row">
              <IonButton fill="clear" size="small" onClick={openEndCalendar}>
                Ends {formatDate(value.endDate!)}
              </IonButton>
              <IonPopover
                isOpen={isEndCalendarOpen}
                onDidDismiss={handleEndCalendarDismiss}
              >
                {isEndCalendarOpen && (
                  <IonDatetime
                    presentation="date"
                    value={getEndDateValue(value.endDate)}
                    onIonChange={handleEndDateChange}
                    min={todayIsoString}
                  />
                )}
              </IonPopover>
            </div>
          )}
        </div>
      )}

      {value && nextOccurrence && (
        <div className="repeat-preview">
          <IonIcon icon={calendarOutline} />
          <IonText color="medium">Next: {formatPreview(nextOccurrence)}</IonText>
        </div>
      )}

      {value && (
        <IonButton
          fill="clear"
          color="danger"
          size="small"
          onClick={handleRemove}
        >
          <IonIcon icon={closeOutline} slot="start" />
          Remove repeat
        </IonButton>
      )}
    </section>
  );
});
