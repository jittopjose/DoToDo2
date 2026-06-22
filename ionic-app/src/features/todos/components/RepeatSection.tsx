import { memo } from 'react';
import { IonChip, IonIcon, IonInput } from '@ionic/react';
import { closeOutline, repeatOutline } from 'ionicons/icons';
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
  { value: 'biweekly' as const, label: 'Biweekly' },
  { value: 'monthly' as const, label: 'Monthly' },
  { value: 'yearly' as const, label: 'Yearly' },
];

export const RepeatSection = memo(function RepeatSection({
  value,
  dueDate,
  onChange,
}: RepeatSectionProps) {
  const handleFrequencyClick = (freq: Recurrence['frequency']) => {
    if (value?.frequency === freq) {
      onChange(undefined);
      return;
    }

    const newRecurrence: Recurrence = {
      frequency: freq,
      interval: 1,
      dayOfMonth: freq === 'monthly' && dueDate ? new Date(dueDate).getDate() : undefined,
      endType: value?.endType ?? 'never',
      endCount: value?.endType === 'after' ? value.endCount : undefined,
      originDate: dueDate ?? Date.now(),
    };
    onChange(newRecurrence);
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
            <IonChip className="task-chip task-chip--repeat-active">
              <span>{formatRecurrenceSummary(value)}</span>
            </IonChip>
          </div>
        )}
      </div>

      <div className="repeat-frequency-grid">
        {FREQUENCIES.map((f) => (
          <button
            key={f.value}
            className={`repeat-chip ${value?.frequency === f.value ? 'repeat-chip--active' : ''}`}
            onClick={() => handleFrequencyClick(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {value && (
        <div className="repeat-end-section">
          <label className="edit-label">End</label>
          <div className="repeat-end-options">
            <button
              className={`repeat-chip ${value.endType !== 'after' ? 'repeat-chip--active' : ''}`}
              onClick={() => onChange({ ...value, endType: 'never', endCount: undefined })}
            >
              Forever
            </button>
            <button
              className={`repeat-chip ${value.endType === 'after' ? 'repeat-chip--active' : ''}`}
              onClick={() => onChange({ ...value, endType: 'after', endCount: value.endCount ?? 10 })}
            >
              After
            </button>
          </div>
          {value.endType === 'after' && (
            <IonInput
              className="repeat-count-input"
              type="number"
              min={1}
              value={value.endCount ?? 10}
              onIonInput={(e) => {
                const count = parseInt(e.detail.value ?? '', 10);
                if (Number.isFinite(count) && count >= 1) {
                  onChange({ ...value, endCount: count });
                }
              }}
              placeholder="Number of occurrences"
            />
          )}
        </div>
      )}

      {value && (
        <button
          className="repeat-remove-button"
          type="button"
          onClick={() => onChange(undefined)}
        >
          <IonIcon icon={closeOutline} />
          Remove repeat
        </button>
      )}
    </section>
  );
});
