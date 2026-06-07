# Inline Task Editing Implementation Plan

## Goal
Add ability to edit todo titles inline by tapping/clicking on them.

## Changes Required

### 1. TodoStore (todoStore.ts)
- Add `updateTodo: (id: string, updates: Partial<Pick<Todo, 'title' | 'description'>>) => void` action
- Update existing todos in-place without affecting other properties

### 2. TodoItem Component (TodoItem.tsx)
- Add `isEditing` state to track edit mode
- On title click: enter edit mode, show IonInput with current title
- On Enter/Blur: save changes via `updateTodo`
- On Escape: cancel and exit edit mode
- Visual: show save/cancel buttons in edit mode, or auto-save

### 3. Todo Types (types.ts)
- Already has `description?: string` field - no changes needed
- Consider adding `editing?: boolean` state (but keep in component state, not persisted)

## User Flow
1. User clicks/taps on a todo title
2. Title transforms into an input field with current text selected
3. User can modify the title
4. Enter or click away saves; Escape cancels

## Risks & Considerations
- Ensure WebChannel communication still works if editing triggers backend logging
- Keep component state local (not persisted) for editing flag
- Maintain existing delete/toggle functionality