# Inline Task Editing & Due Date Editing

## Goal
Add inline editing for todo titles and due dates with mobile-friendly interactions.

## Already Implemented
- Title editing: Click on title → inline input appears → Enter/blur saves, Escape cancels
- Due date already displays in AM/PM format

## Additional: Due Date Editing

### Changes Required

### 1. TodoItem Component (TodoItem.tsx)
- Add `showDueDatePicker` state for mobile-friendly datetime picker
- Add `dueDateEdit` state to track current due date value during edit
- Import `IonPopover` and `IonDatetime` from Ionic
- Import `calendarOutline` icon

### 2. Implementation Details
```tsx
// Add to imports:
import { IonItem, IonLabel, IonCheckbox, IonButton, IonIcon, IonInput, IonPopover, IonDatetime } from '@ionic/react';
import { trashOutline, calendarOutline } from 'ionicons/icons';

// Inside TodoItem component - add states:
const [showDueDatePicker, setShowDueDatePicker] = useState(false);

// Add to JSX - calendar button next to due date:
{todo.dueDate && (
    <>
        <IonButton fill="clear" size="small" onClick={() => setShowDueDatePicker(true)}>
            <IonIcon icon={calendarOutline} />
        </IonButton>
        <IonPopover isOpen={showDueDatePicker} onDidDismiss={() => setShowDueDatePicker(false)}>
            <IonDatetime
                value={todo.dueDate ? new Date(todo.dueDate).toISOString() : ''}
                onIonChange={e => {
                    const newDueDate = e.detail.value ? new Date(e.detail.value).getTime() : undefined;
                    updateTodo(todo.id, { dueDate: newDueDate });
                }}
                presentation="date-time"
            />
        </IonPopover>
    </>
)}

// Also add a "Set Due Date" button when no due date exists (inside edit mode):
{!todo.dueDate && isEditing && (
    <IonButton fill="clear" size="small" onClick={() => setShowDueDatePicker(true)}>
        <IonIcon icon={calendarOutline} />
    </IonButton>
)}
```

### 3. User Flow for Due Date Editing
1. Click calendar icon → opens datetime picker
2. Select new date/time → saves automatically
3. Picker auto-dismisses after selection
4. Touch targets sized appropriately for mobile

### 4. Risks & Considerations
- IonDatetime requires ISO date string format
- Convert between timestamp (storage) and ISO string (UI)
- Due date value can be undefined to clear/remove it

## Implementation Tasks
- [ ] Update TodoItem.tsx imports
- [ ] Add due date editing state
- [ ] Add calendar button next to due date display
- [ ] Add IonDatetime popover
- [ ] Add "Set Due Date" in edit mode for todos without due date
- [ ] Rebuild with `npm run build`