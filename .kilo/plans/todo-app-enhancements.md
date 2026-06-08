# Todo App Enhancement Plan - Market-Comparable Features

## Current State
- Basic CRUD todo operations (add, toggle, delete)
- Due date support (date-time picker)
- Inline title editing
- Priority indicators with color coding
- Search & filter with Clear Completed
- Zustand state management with persistence
- Ionic React mobile-friendly UI

## Target Features (Phase 1: High Priority)

### 1. Priority Support ✅ COMPLETED
**Changes Required:**
- Add priority color indicators to TodoItem
- Add priority selector in TodoInput/edit mode
- Update todoStore to handle priority updates

**Implementation:**
- Display colored dot next to title (red=high, orange=medium, green=low)
- Add priority button in edit mode to cycle through levels
- Priority state stored in todoStore with type signature

### 2. Search & Filter ✅ COMPLETED
**Changes Required:**
- Add search input to Page header
- Add search state to todoStore/filter logic
- Add "Clear Completed" button

**Implementation:**
- Text filter that searches in title and description
- Combined with existing all/active/completed filter
- Search results update automatically as you type
- Added "Clear Completed" button in header and menu

### 3. Task Count Badge ✅ COMPLETED
**Changes Required:**
- Update Menu component to show counts
- Add count computation in todoStore

**Implementation:**
- Display active task count in menu next to Inbox item
- Show completed task count

## Phase 2: Enhanced Organization

### 4. Labels/Categories (Beyond Folders) ⏳ PENDING
**Changes Required:**
- Extend Todo type with labels array
- Add label management in todoStore
- Create label picker component

**Implementation:**
- Multiple labels per task
- Label-based filtering and organization
- Color-coded labels

### 5. Sort Options ⏳ PENDING
**Changes Required:**
- Add sort state (by date, priority, created)
- Update getFilteredTodos with sort logic

**Implementation:**
- Sort by due date, priority, or creation time
- Toggleable sort options in UI
- Maintain sort preference

## Phase 3: Mobile UX Improvements

### 6. Swipe Actions ⏳ PENDING
**Changes Required:**
- Wrap TodoItem in IonItemSliding
- Add swipe-to-reveal edit/delete buttons
- Add swipe-to-complete gesture

**Implementation:**
- Swipe left to complete
- Swipe right for quick actions
- Touch-optimized gestures

### 7. Keyboard Shortcuts ⏳ PENDING
**Changes Required:**
- Add keyboard event listeners
- Map keys to actions (n=new, / =search, etc.)

**Implementation:**
- Global shortcuts for common actions
- Context-sensitive key mappings
- Mobile-friendly gesture alternatives

## Search Feature Implementation Details

### Components Modified:
1. **todoStore.ts** - Added searchTerm state, setSearchTerm and clearCompleted actions, updated getFilteredTodos with search logic
2. **Page.tsx** - Added IonSearchbar in header toolbar with debounce, added Clear Completed button
3. **Menu.tsx** - Added Clear Completed menu item
4. **TodoList.tsx** - Moved filtering logic to component with useMemo for stable references

### State Changes:
- Added `searchTerm: string` to TodoStore
- Added `setSearchTerm(term)` action
- Added `clearCompleted()` action that removes completed todos
- Updated filter logic to combine search with status filter

### User Experience:
- Search input appears in page header toolbar
- Real-time filtering as user types (case-insensitive)
- "Clear Completed" button in both header and side menu
- Search persists across app sessions via zustand persist middleware