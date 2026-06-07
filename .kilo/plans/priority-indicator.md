# Priority Indicator Implementation

## UX Behavior & Design

### Visual Indicator
- Small colored dot appears to the LEFT of the checkbox
- Colors: Green (low), Orange/Amber (medium), Red (high)
- No priority = no indicator shown

### Interaction
- **View mode**: Priority indicator is read-only (just shows the level)
- **Edit mode**: Tapping the priority button cycles through levels:
  - None → Low → Medium → High → None (and repeat)
- Visual feedback: Button color changes to match selected priority

### User Flow
1. User creates a task (default: no priority)
2. User taps priority button in edit mode
3. Priority cycles: gray (none) → green (low) → orange (medium) → red (high) → gray
4. User sees immediate visual indicator on the task

## Implementation

### 1. TodoStore (todoStore.ts)
Update the interface:
```typescript
updateTodo: (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'dueDate' | 'priority'>>) => void;
```

### 2. TodoItem.tsx
- Import `ellipse` icon from ionicons
- Add priority indicator next to checkbox in view mode
- Add priority button in edit mode next to calendar button

```tsx
import { ellipse } from 'ionicons/icons';

const priorityColors = {
    low: 'var(--ion-color-success)',
    medium: 'var(--ion-color-warning)', 
    high: 'var(--ion-color-danger)'
};

// In view mode (before IonLabel):
{todo.priority && (
    <IonIcon icon={ellipse} style={{ 
        color: priorityColors[todo.priority], 
        marginRight: '8px',
        fontSize: '12px'
    }} />
)}

// In edit mode (next to calendar button):
<IonButton fill="clear" size="small" onClick={() => {
    const levels: Array<'low' | 'medium' | 'high' | undefined> = ['low', 'medium', 'high', undefined];
    const currentIndex = levels.indexOf(todo.priority as any);
    const nextPriority = levels[(currentIndex + 1) % levels.length];
    updateTodo(todo.id, { priority: nextPriority });
}}>
    <IonIcon icon={ellipse} style={{ 
        color: todo.priority ? priorityColors[todo.priority] : 'var(--ion-color-medium)',
        fontSize: '12px'
    }} />
</IonButton>
```

### 3. TodoInput.tsx (Bonus - Set priority during creation)
- Add priority button that persists priority through task creation
- Same cycle behavior: None → Low → Medium → High → None

## Risks
- Need to ensure edit mode priority button doesn't interfere with title input
- Icon may be too small on mobile - consider larger touch target