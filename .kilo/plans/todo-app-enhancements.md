# Todo App Enhancement Plan - Market-Comparable Features

## Current State
- Basic CRUD todo operations (add, toggle, delete)
- Due date support (date-time picker)
- Inline title editing
- Zustand state management with persistence
- Ionic React mobile-friendly UI

## Target Features (Phase 1: High Priority)

### 1. Priority Support
**Changes Required:**
- Add priority color indicators to TodoItem
- Add priority selector in TodoInput/edit mode
- Update todoStore to handle priority updates

**Implementation:**
- Display colored badge next to title (red=high, orange=medium, green=low)
- Add priority button in edit mode to cycle through levels
- Auto-sort by priority when listing

### 2. Search & Filter
**Changes Required:**
- Add search input to Page header
- Add search state to todoStore/filter logic
- Add "Clear Completed" button

**Implementation:**
- Text filter that searches in title and description
- Combined with existing all/active/completed filter

### 3. Task Count Badge
**Changes Required:**
- Update Menu component to show counts
- Add count computation in todoStore

## Phase 2: Enhanced Organization

### 4. Labels/Categories (Beyond Folders)
**Changes Required:**
- Extend Todo type with labels array
- Add label management in todoStore
- Create label picker component

### 5. Sort Options
**Changes Required:**
- Add sort state (by date, priority, created)
- Update getFilteredTodos with sort logic

## Phase 3: Mobile UX Improvements

### 6. Swipe Actions
**Changes Required:**
- Wrap TodoItem in IonItemSliding
- Add swipe-to-reveal edit/delete buttons
- Add swipe-to-complete gesture

### 7. Keyboard Shortcuts
**Changes Required:**
- Add keyboard event listeners
- Map keys to actions (n=new, / =search, etc.)

## Risks & Considerations
- Each phase should maintain backward compatibility
- Persistence schema changes require migration handling
- Mobile gestures may conflict with inline editing
- Keep desktop and mobile UX consistent