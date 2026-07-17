import { memo, useCallback, useMemo, useState } from 'react';
import {
    IonDatetime,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonToggle,
} from '@ionic/react';
import {
    addOutline,
    calendarOutline,
    checkmarkOutline,
    chevronDownOutline,
    closeOutline,
    optionsOutline,
    removeOutline,
    repeatOutline,
} from 'ionicons/icons';
import { Recurrence } from '../../shared/types';
import { formatRecurrenceSummary } from '../../shared/utils/recurrence';

interface RepeatSectionProps {
    value?: Recurrence;
    dueDate?: number;
    onChange: (recurrence: Recurrence | undefined) => void;
}

const FREQUENCIES = [
    { value: 'daily' as const, label: 'Daily' },
    { value: 'weekdays' as const, label: 'Weekdays' },
    { value: 'weekly' as const, label: 'Weekly' },
    { value: 'monthly' as const, label: 'Monthly' },
    { value: 'yearly' as const, label: 'Yearly' },
];

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CUSTOM_UNITS: { value: Recurrence['frequency']; label: string }[] = [
    { value: 'daily', label: 'Day' },
    { value: 'weekly', label: 'Week' },
    { value: 'monthly', label: 'Month' },
    { value: 'yearly', label: 'Year' },
];

const MAX_INTERVAL = 99;

function getDefaultWeekday(dueDate?: number): number {
    if (dueDate) return new Date(dueDate).getDay();
    return new Date().getDay();
}

function getDefaultEndDate(): number {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.getTime();
}

function formatDateShort(ts: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(ts);
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function getEndDateIso(ts?: number): string {
    const d = ts ? new Date(ts) : new Date();
    if (!ts) d.setMonth(d.getMonth() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function computeNext(recurrence: Recurrence, origin: number): Date | null {
    const now = new Date(origin);
    let next: Date | undefined;

    switch (recurrence.frequency) {
        case 'daily':
            next = new Date(now);
            next.setDate(next.getDate() + recurrence.interval);
            break;
        case 'weekdays': {
            next = new Date(now);
            do {
                next.setDate(next.getDate() + 1);
            } while (next.getDay() === 0 || next.getDay() === 6);
            break;
        }
        case 'weekly': {
            if (recurrence.weekdays && recurrence.weekdays.length > 0) {
                const sorted = [...recurrence.weekdays].sort((a, b) => a - b);
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
                next.setDate(next.getDate() + 7 * recurrence.interval);
            }
            break;
        }
        case 'monthly': {
            next = new Date(now);
            next.setMonth(next.getMonth() + recurrence.interval);
            const targetDay = recurrence.dayOfMonth ?? now.getDate();
            const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
            next.setDate(Math.min(targetDay, daysInMonth));
            break;
        }
        case 'yearly': {
            next = new Date(now);
            next.setFullYear(next.getFullYear() + recurrence.interval);
            break;
        }
        default:
            return null;
    }
    return next ?? null;
}

export const RepeatSection = memo(function RepeatSection({
    value,
    dueDate,
    onChange,
}: RepeatSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const [customMode, setCustomMode] = useState(false);
    const [customUnit, setCustomUnit] = useState<Recurrence['frequency']>('weekly');
    const [customInterval, setCustomInterval] = useState(2);

    const isActive = !!value;
    const summary = value ? formatRecurrenceSummary(value) : null;
    const nextOccurrence = useMemo(() => {
        if (!value) return null;
        const origin = dueDate ?? Date.now();
        return computeNext({ ...value, originDate: origin }, origin);
    }, [value, dueDate]);

    const handleFrequencyClick = useCallback((freq: Recurrence['frequency']) => {
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
    }, [value, dueDate, onChange]);

    const isActiveFreq = (freq: string) => value?.frequency === freq && !customMode;

    const handleWeekdayToggle = useCallback((day: number) => {
        if (!value || value.frequency !== 'weekly') return;
        const current = value.weekdays ?? [getDefaultWeekday(dueDate)];
        const next = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day].sort((a, b) => a - b);
        if (next.length === 0) return;
        onChange({ ...value, weekdays: next });
    }, [value, dueDate, onChange]);

    const isWeekSelected = (i: number) => value?.weekdays?.includes(i) ?? false;

    const handleCustomClick = useCallback(() => {
        if (customMode && value) {
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
    }, [customMode, customUnit, customInterval, value, dueDate, onChange]);

    const handleIntervalChange = useCallback((delta: number) => {
        const next = Math.min(MAX_INTERVAL, Math.max(1, customInterval + delta));
        setCustomInterval(next);
        if (customMode && value) {
            onChange({ ...value, interval: next });
        }
    }, [customInterval, customMode, value, onChange]);

    const handleCustomUnitChange = useCallback((unit: Recurrence['frequency']) => {
        setCustomUnit(unit);
        if (customMode && value) {
            onChange({
                ...value,
                frequency: unit,
                interval: customInterval,
                dayOfMonth: unit === 'monthly' && dueDate ? new Date(dueDate).getDate() : undefined,
            });
        }
    }, [customMode, value, customInterval, dueDate, onChange]);

    const handleEndToggle = useCallback((isOn: boolean) => {
        if (!value) return;
        onChange({
            ...value,
            endType: isOn ? 'until' : 'never',
            endDate: isOn ? (value.endDate ?? getDefaultEndDate()) : undefined,
        });
    }, [value, onChange]);

    const handleEndDateChange = useCallback((isoStr: string | undefined) => {
        if (!value || !isoStr) return;
        const datePart = isoStr.split('T')[0];
        const [y, m, d] = datePart.split('-').map(Number);
        const timestamp = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
        if (Number.isFinite(timestamp)) {
            onChange({ ...value, endDate: timestamp });
        }
    }, [value, onChange]);

    const handleRemove = useCallback(() => {
        setCustomMode(false);
        onChange(undefined);
        setExpanded(false);
    }, [onChange]);

    const todayIsoString = new Date().toISOString().split('T')[0];

    /* ── Collapsed (no repeat) ── */
    if (!isActive && !expanded) {
        return (
            <div
                className="repeat-card repeat-card--empty"
                onClick={() => setExpanded(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpanded(true);
                    }
                }}
                aria-label="Set a repeat schedule"
            >
                <IonIcon icon={repeatOutline} className="repeat-card-icon" />
                <div className="repeat-card-body">
                    <span className="repeat-card-label">Repeat</span>
                    <span className="repeat-card-action">Set a schedule</span>
                </div>
                <IonIcon icon={chevronDownOutline} className="repeat-card-chevron" />
            </div>
        );
    }

    /* ── Collapsed (with repeat) ── */
    if (isActive && !expanded) {
        return (
            <div
                className="repeat-card repeat-card--active"
                onClick={() => setExpanded(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpanded(true);
                    }
                }}
                aria-label={`Repeats ${summary}, tap to edit`}
            >
                <IonIcon icon={repeatOutline} className="repeat-card-icon" />
                <div className="repeat-card-body">
                    <span className="repeat-card-label">Repeats: {summary}</span>
                    {nextOccurrence && (
                        <span className="repeat-card-action">Next: {formatDateShort(nextOccurrence.getTime())}</span>
                    )}
                </div>
                <IonIcon icon={chevronDownOutline} className={`repeat-card-chevron ${expanded ? 'is-open' : ''}`} />
            </div>
        );
    }

    /* ── Expanded editor ── */
    return (
        <div className="repeat-card repeat-card--expanded">
            <div
                className="repeat-card-head"
                onClick={() => setExpanded(false)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpanded(false);
                    }
                }}
            >
                <IonIcon icon={repeatOutline} className="repeat-card-icon" />
                <span className="repeat-card-head-title">Repeat</span>
                <IonIcon icon={checkmarkOutline} className="repeat-card-done" />
            </div>

            <div className="repeat-freq-grid">
                {FREQUENCIES.map((f) => (
                    <button
                        key={f.value}
                        className={`repeat-chip${isActiveFreq(f.value) ? ' is-active' : ''}`}
                        onClick={() => handleFrequencyClick(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
                <button
                    className={`repeat-chip${customMode ? ' is-active' : ''}`}
                    onClick={handleCustomClick}
                >
                    <IonIcon icon={optionsOutline} className="repeat-chip-icon" />
                    Custom
                </button>
            </div>

            {value?.frequency === 'weekly' && !customMode && (
                <div className="repeat-weekday-row">
                    {WEEKDAY_LABELS.map((label, i) => (
                        <button
                            key={i}
                            className={`repeat-weekday-btn${isWeekSelected(i) ? ' is-active' : ''}`}
                            onClick={() => handleWeekdayToggle(i)}
                            aria-label={WEEKDAY_FULL[i]}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {customMode && (
                <div className="repeat-custom-row">
                    <span className="repeat-custom-label">Every</span>
                    <div className="repeat-stepper">
                        <button
                            className="repeat-stepper-btn"
                            onClick={() => handleIntervalChange(-1)}
                            disabled={customInterval <= 1}
                            aria-label="Decrease interval"
                        >
                            <IonIcon icon={removeOutline} />
                        </button>
                        <span className="repeat-stepper-value">{customInterval}</span>
                        <button
                            className="repeat-stepper-btn"
                            onClick={() => handleIntervalChange(1)}
                            disabled={customInterval >= MAX_INTERVAL}
                            aria-label="Increase interval"
                        >
                            <IonIcon icon={addOutline} />
                        </button>
                    </div>
                    <div className="repeat-custom-unit">
                        <IonSelect
                            className="repeat-unit-select"
                            value={customUnit}
                            onIonChange={(e) => handleCustomUnitChange(e.detail.value as Recurrence['frequency'])}
                            interface="action-sheet"
                        >
                            {CUSTOM_UNITS.map((u) => (
                                <IonSelectOption key={u.value} value={u.value}>{u.label}</IonSelectOption>
                            ))}
                        </IonSelect>
                    </div>
                </div>
            )}

            {value && (
                <div className="repeat-end">
                    <div className="repeat-end-row">
                        <span className="repeat-end-label">End repeat</span>
                        <IonToggle
                            checked={value.endType === 'until'}
                            onIonChange={(e) => handleEndToggle(e.detail.checked)}
                        />
                    </div>
                    {value.endType === 'until' && (
                        <div className="repeat-end-calendar">
                            <IonDatetime
                                presentation="date"
                                value={getEndDateIso(value.endDate)}
                                min={todayIsoString}
                                onIonChange={(e) => handleEndDateChange(e.detail.value as string | undefined)}
                            />
                        </div>
                    )}
                </div>
            )}

            {value && nextOccurrence && (
                <div className="repeat-preview">
                    <IonIcon icon={calendarOutline} />
                    <span>Next: <strong>{formatDateShort(nextOccurrence.getTime())}</strong></span>
                </div>
            )}

            <button className="repeat-remove" onClick={handleRemove}>
                <IonIcon icon={closeOutline} />
                <span>Remove repeat</span>
            </button>
        </div>
    );
});
