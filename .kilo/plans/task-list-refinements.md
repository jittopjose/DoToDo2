# Task List Area Refinements

## Current State Analysis

The task list area consists of:
- **TodoList.tsx**: Renders filtered todos with basic empty state
- **TodoItem.tsx**: Individual task items with editing, priority, due dates, checklists, shopping items
- **TodoInput.tsx**: Task creation with type selector and additional fields

## Identified Issues & Proposed Improvements

### 1. Empty State Enhancement [High Priority]
**Current**: Basic "No tasks found" message
**Improvement**: 
- Differentiate empty states: "No tasks yet" vs "No matching tasks"
- Add illustration/icon for visual appeal
- Include actionable hint (tap to add first task)

### 2. Overdue Task Visual Indicator [High Priority]
**Current**: Due dates shown but no visual distinction for overdue
**Improvement**:
- Highlight overdue tasks with red left border (subtle styling)
- Show "overdue" badge for overdue tasks
- Date formatting shows "X days ago" for past dates
- Red alert icon replaces priority dot for overdue
**Decision**: Red border + alert icon for overdue tasks (subtle highlight)

### 3. Checklist Subtask Toggle [Medium Priority]
**Current**: Checklist items are read-only display
**Improvement**:
- Make checklist items tappable to toggle completion independently
- Add strikethrough animation for completed subtasks
- Show progress indicator (2/5 completed)
**Decision**: Subtasks are independently tappable for completion

### 4. Swipe Actions / Context Menus [Medium Priority]
**Current**: Delete button always visible, takes horizontal space
**Improvement**:
- Implement Material-style swipe action with colored icon background
- Use IonActionSheet for more options on long-press
- Reduces visual clutter, more native mobile feel
**Decision**: Material-style swipe action (colored icon reveal)

### 5. Inline Editing Improvements [Medium Priority]
**Current**: Only title is editable inline
**Improvement**:
- Allow inline editing of description
- Edit shopping item quantity/price inline
- Auto-focus on the clicked field, not just title

### 6. Animation & Transitions [Low Priority]
**Current**: Instant add/remove with no transition
**Improvement**:
- Add fade-in for new tasks
- Slide-out animation for deleted tasks
- Smooth checkbox transition

### 7. Task List Header / Stats [Low Priority]
**Current**: No summary info on the list
**Improvement**:
- Show task count for current list
- Show completion progress bar
- Visual filter indicator (active/completed/all)

### 8. Accessibility Improvements [Medium Priority]
**Current**: Basic Ionic accessibility
**Improvement**:
- Add ARIA labels for screen readers
- Keyboard navigation for all interactive elements
- Focus management for edit mode

## Implementation Priority

**Recommended Order**:
1. Overdue task visual indicator (high impact, low complexity)
2. Empty state enhancement (high impact, low complexity)
3. Checklist subtask toggle (medium impact, medium complexity)
4. Swipe actions (medium impact, medium complexity)
5. Inline editing improvements (medium priority)
6. Accessibility improvements (important for completeness)

## Implementation Tasks

### High Priority (Phase 1) ✅ COMPLETED
- [x] Add `isOverdue` helper function in TodoItem.tsx
- [x] Apply thin red left border to overdue tasks (subtle styling)
- [x] Update formatDate to show "X days ago" for past dates
- [x] Create differentiated empty states in TodoList.tsx
- [x] Add empty state illustration/icon (documentTextOutline)
- [x] Add `toggleSubtask` action to todoStore.ts
- [x] Wire up click handler for checklist subtasks
- [x] Add checklist progress indicator (completed/total)

### Medium Priority (Phase 2) ✅ COMPLETED
- [x] Implement IonItemSliding with IonItemOptions for swipe actions (Material-style)

### Medium Priority (Phase 2b) ✅ COMPLETED
- [x] Add description inline editing in edit mode
- [x] Add shopping item quantity/price inline editing
- [x] Auto-focus on clicked field for inline edits

### Low Priority (Phase 3) ✅ COMPLETED
- [x] Add CSS transitions for task animations
- [x] Add task count and progress summary to Page header
- [x] Add ARIA labels for screen readers
- [x] Implement keyboard navigation shortcuts (Ionic provides built-in support)
- [x] Add Done/Cancel buttons for mobile touch UX in edit modes

### Mobile UX Notes
- Edit mode now shows explicit "Done" and "Cancel" buttons
- Shopping edit mode shows "Done" and "Cancel" buttons
- Users can tap outside the input to trigger blur (still works)
- Auto-focus automatically focuses first input when entering edit mode

## Files to Modify
- `src/features/todos/components/TodoItem.tsx` - Overdue styling, subtask toggle
- `src/features/todos/components/TodoList.tsx` - Empty state enhancement
- `src/features/todos/store/todoStore.ts` - toggleSubtask action
- `src/pages/Page.tsx` - Progress indicator