# Phase 1 — Shopping List Feature

## Overview

A shopping list system where each **shopping list is a single `DoTodo` entry**
with embedded items (like task + subtasks). Multiple named lists coexist in
Active/Archived sections.

**Key design decisions**:
- Items live in `shoppingItems: ShoppingItem[]` on the parent `DoTodo` — one entry per list
- Inline expand-to-edit on items (no separate edit page navigation)
- Quantity/price input is collapsed by default (quick-add by name only)
- Completed items stay visible with strikethrough (like tasks)
- Archive is a manual action on the whole list (not auto-archived)

---

## Step 1 — Data Model + Store (Priority: HIGH)

**Goal**: Add `ShoppingItem` type, extend `DoTodo`, add store actions and selectors.

### Files to modify

| File | Change |
|------|--------|
| `src/features/shared/types.ts` | Add `ShoppingItem` interface; add `shoppingItems` and `isArchived` to `DoTodo` |
| `src/features/shared/store/doTodoStore.ts` | Add 6 new actions + 3 new selectors |

### New type

```ts
export interface ShoppingItem {
    id: string;
    title: string;
    isCompleted: boolean;
    quantity?: number;
    price?: number;
}
```

### DoTodo changes

```ts
export interface DoTodo extends BaseItem {
    // existing fields unchanged
    shoppingItems?: ShoppingItem[];  // NEW
    isArchived?: boolean;           // NEW
}
```

### New store actions

| Action | Signature | Behaviour |
|--------|-----------|----------|
| `addShoppingList` | `(title: string) => void` | Creates `DoTodo` with `itemType: 'shopping'`, `shoppingItems: []` |
| `addShoppingItem` | `(listId: string, title: string, quantity?: number, price?: number) => void` | Pushes new `ShoppingItem` to `shoppingItems` |
| `toggleShoppingItem` | `(listId: string, itemId: string) => void` | Toggles `isCompleted` on the item |
| `updateShoppingItem` | `(listId: string, itemId: string, updates: Partial<ShoppingItem>) => void` | Patches fields on the item |
| `removeShoppingItem` | `(listId: string, itemId: string) => void` | Removes item from array |
| `archiveShoppingList` | `(listId: string) => void` | Toggles `isArchived` |

### New selectors

| Selector | Returns |
|----------|---------|
| `selectActiveShoppingLists` | Entries where `itemType === 'shopping' && shoppingItems !== undefined && !isArchived` |
| `selectArchivedShoppingLists` | Same but `isArchived === true` |
| `selectShoppingListSummary(listId)` | `{ count, total, completedCount }` from items array |

### Acceptance criteria

- TypeScript compiles clean
- Calling `addShoppingList('Weekly Groceries')` creates a store entry with empty items array
- `selectActiveShoppingLists` returns newly created lists
- `selectShoppingListSummary` returns correct counts

### Dependencies

- Zustand store persistence (already wired up — `schedulePersist` runs on store changes)

---

## Step 2 — ShoppingItem with Inline Expand-to-Edit (Priority: HIGH)

**Goal**: A single component that displays a shopping item and lets the user
edit it inline by expanding the row.

### Existing files to repurpose

| File | Action |
|------|--------|
| `src/features/shopping/components/ShoppingItem.tsx` | Rewrite with inline edit |
| `src/features/shopping/components/ShoppingItem.css` | Rewrite with expand animation |

### ShoppingItem — Collapsed state (default)

```
┌────────────────────────────────────────────┐
│  ☐ 🛒 Milk                   ×2    $3.99  │
└────────────────────────────────────────────┘
```

- Checkbox toggles completion (strikethrough when done)
- Cart icon, name, quantity badge (`×N`), price chip (`$3.99`)
- Tap anywhere on the body (not checkbox) → expands to edit

### ShoppingItem — Expanded state

```
┌────────────────────────────────────────────┐
│  ☐ 🛒 Milk                   ×2    $3.99  │
├────────────────────────────────────────────┤
│  Name                                      │
│  ┌────────────────────────────────────────┐│
│  │ Milk                                   ││
│  └────────────────────────────────────────┘│
│  ┌──────────────┐  ┌─────────────────────┐ │
│  │ [−]  2  [+]  │  │ $ [3.99    ]        │ │
│  └──────────────┘  └─────────────────────┘ │
│  [Save]                    [🗑️ Delete]      │
└────────────────────────────────────────────┘
```

- Only **one item expands at a time** (the detail page manages this via a `editingItemId` state)
- Save → calls `updateShoppingItem`, collapses
- Delete → calls `removeShoppingItem`, collapses
- Animation: `max-height` + opacity transition

### Props interface

```ts
interface ShoppingItemProps {
    item: ShoppingItem;
    isEditing: boolean;
    onToggle: () => void;
    onStartEdit: () => void;
    onSave: (updates: Partial<ShoppingItem>) => void;
    onDelete: () => void;
    onCancel: () => void;
}
```

### Acceptance criteria

- Item shows name, checkbox, quantity badge, price chip
- Checking the checkbox → strikethrough style
- Tapping the item → expands editor below the summary row
- Editing name/qty/price → Save → collapses with updated values
- Delete → item removed from list
- Smooth expand/collapse animation

---

## Step 3 — Shopping List Detail Page (Priority: HIGH)

**Goal**: A page showing items in a single shopping list with add-input, total bar, and archive.

### New files

| File | Purpose |
|------|---------|
| `src/features/shopping/pages/ShoppingListDetail.tsx` | Items in one list |
| `src/features/shopping/pages/ShoppingListDetail.css` | Detail page styles |

### Existing files to repurpose

| File | Action |
|------|--------|
| `src/features/shopping/pages/ShoppingPage.tsx` **→** | Moves to `ShoppingListDetail.tsx` (the old flat page becomes the detail view) |

### Wireframe

```
┌────────────────────────────────────────────┐
│  ← Shopping Lists    Weekly Groceries   📦 │ ← archive button
│                                            │
│  ┌─ 🔍 Search items... ──────────────────┐│
│  └────────────────────────────────────────┘│
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  🛒  TOTAL                     $34.50  ││
│  └────────────────────────────────────────┘│
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  📝 [What to buy?                  ]   ││
│  │  (+ qty) (+ price)              [+]   ││
│  └────────────────────────────────────────┘│
│                                            │
│  ☐ 🛒 Milk                   ×2    $3.99  │ ← tap to expand
│  ☑ 🛒 Eggs                   ×12   $5.99  │ ← strikethrough
│  ☐ 🛒 Bread                  ×1    $2.49  │
│  ☐ 🛒 Apples                 ×5    $6.00  │
│  ☐ 🛒 Chicken breast         ×2    $8.50  │
│  ☐ 🛒 Olive oil              ×1    $7.99  │
└────────────────────────────────────────────┘
```

### Input widget (at bottom of search/total section)

- **Collapsed**: text field + "+" button (for quick adds, no qty/price)
- **Expanded**: text field + quantity stepper + price field + "+" button
- User optionally fills quantity/price before adding, or adds first and edits inline later

### Functionality

| Feature | Detail |
|---------|--------|
| **Add item** | Text + optional qty/price → calls `addShoppingItem` |
| **Toggle item** | Checkbox → calls `toggleShoppingItem` |
| **Edit item** | Tap → sets `editingItemId`, only that item expands |
| **Save edit** | Expand view Save → calls `updateShoppingItem`, clears `editingItemId` |
| **Delete item** | Expand view Delete → calls `removeShoppingItem`, clears `editingItemId` |
| **Archive list** | Header button → calls `archiveShoppingList` |
| **Search** | Filters items by name locally |
| **Total** | Derives `{ count, total, completedCount }` from items array |
| **Empty state** | "No items yet — add your first item above" |

### Acceptance criteria

- Navigate to `/shopping/:id` → see the list detail page
- Add items with just a name → appear in list
- Add items with name + qty + price → show quantity badge + price chip
- Checkbox → strikethrough
- Tap to expand → edit inline → save → collapse with updates
- Archive button → list moves to archived (overview no longer shows it)
- Total bar updates in real-time
- Search filters items by name

---

## Step 4 — Shopping Overview Page (Priority: HIGH)

**Goal**: Landing page showing all active shopping lists as cards, with create-new-list input.

### New files

| File | Purpose |
|------|---------|
| `src/features/shopping/pages/ShoppingOverview.tsx` | List-of-lists page |
| `src/features/shopping/pages/ShoppingOverview.css` | Overview page styles |

### Wireframe

```
┌────────────────────────────────────────────┐
│  ← Tasks              Shopping             │
│                                            │
│  Shopping Lists                            │
│  ┌────────────────────────────────────────┐│
│  │ 📝 [New list name...            ] [+]  ││ ← input to create list
│  └────────────────────────────────────────┘│
│                                            │
│  ┌─🛒 Weekly Groceries ──────────────────┐│
│  │  12 items  ·  $34.50               ││
│  │  ▓▓▓▓▓▓▓░░░░  8/12 done           ││
│  └────────────────────────────────────────┘│
│                                            │
│  ┌─🛒 Hardware Store ────────────────────┐│
│  │  5 items  ·  $89.20                  ││
│  │  ▓░░░░░░░░░  1/5 done               ││
│  └────────────────────────────────────────┘│
│                                            │
│  ▶ Archived (2)                            │ ← collapsible section
│    ┌─🛒 Party Supplies ──────────────────┐│
│    │  8 items  ·  $23.00                  ││
│    └───────────────────────────────────────┘│
│    ┌─🛒 Office Run ──────────────────────┐│
│    │  3 items  ·  $12.75                  ││
│    └───────────────────────────────────────┘│
└────────────────────────────────────────────┘
```

### List card

Each card shows:
- Name (title)
- Item count + total price
- Progress bar + "N/M done" label
- Tap → navigates to `/shopping/:id`

### Active vs Archived

- **Active section**: unarchived lists (default view)
- **Archived section**: collapsed by default, shows archived lists with tap-to-unarchive

### Acceptance criteria

- Create a new list → appears as a card in Active section
- Tap a card → navigate to the list detail page
- Archive a list → card moves to Archived section
- Archived section collapsible
- Empty state when no lists exist: "No shopping lists yet. Create your first one above."

---

## Step 5 — Barcode Scanning (Priority: MEDIUM)

**Goal**: Camera-based barcode scanning with Open Food Facts lookup.
(Unchanged from original plan — implementation details same.)

### Files to create

| File | Purpose |
|------|---------|
| `src/features/shopping/components/ScannerOverlay.tsx` | Full-screen camera preview in IonModal |
| `src/features/shopping/components/ScannerOverlay.css` | Overlay styles |
| `src/features/shopping/services/barcode.service.ts` | @zxing/library wrapper + Open Food Facts API |

### Files to modify

| File | Change |
|------|--------|
| `ShoppingListDetail.tsx` | Add barcode button beside add-input |
| `dotodo2.apparmor` | Add `"camera"` policy group |
| `package.json` | Add `@zxing/library` |

### Architecture

```
User taps 📷
  → ScannerOverlay opens (IonModal)
  → navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  → @zxing BrowserMultiFormatReader decodes in real-time
  → On decode success:
      → GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json
      → Extract product_name, categories_tags, image_url
      → Close overlay, pre-fill input fields (name + category)
  → Manual entry fallback always visible
  → If getUserMedia fails → show "Camera not available"
```

### Acceptance criteria

- Barcode button → opens camera overlay
- Scan real barcode → auto-fills name
- Manual barcode entry available
- Graceful camera permission denial

---

## Step 6 — Real-Time Sharing (Priority: LOW — Deferred)

**Goal**: Real-time sync via Firebase. (Unchanged from original plan.)

### Files to create

| File | Purpose |
|------|---------|
| `src/services/firebase.service.ts` | Firebase init, anonymous auth, Firestore refs |
| `src/services/share.service.ts` | Invite code gen, Firestore merge into Zustand |

### Files to modify

| File | Change |
|------|--------|
| `ShoppingListDetail.tsx` | Add Share button in header |
| `ShoppingOverview.tsx` | Show "shared with N" indicator |
| `dotodo2.apparmor` | Add `"network"` policy groups |
| `package.json` | Add `firebase` |

### Architecture

```
User taps Share
  → Firebase anonymous auth (silent)
  → Generate random 6-char invite code
  → Show code + QR in modal
  → Remote user enters code → subscribe to Firestore collection
  → onSnapshot → merge writes into Zustand store
  → Zustand writes → Firestore writes (bidirectional)
```

---

## Appendix: Route Map

| Route | Page | Status |
|-------|------|--------|
| `/shopping` | `ShoppingOverview` | New (Step 4) |
| `/shopping/:listId` | `ShoppingListDetail` | Repurposed from old `ShoppingPage` (Step 3) |

No item-edit route — editing is inline via expand (Step 2).

---

## Appendix: File Tree After Phase 1

```
src/features/shopping/
├── components/
│   ├── ScannerOverlay.tsx
│   ├── ScannerOverlay.css
│   ├── ShoppingItem.tsx          ← rewritten with inline edit
│   └── ShoppingItem.css
├── pages/
│   ├── ShoppingListDetail.tsx    ← repurposed from old ShoppingPage
│   ├── ShoppingListDetail.css
│   ├── ShoppingOverview.tsx      ← new
│   └── ShoppingOverview.css
├── services/
│   └── barcode.service.ts
└── (utils/ directory — unused, categories deferred)
```

Old files to delete:
- `ShoppingInput.tsx` / `.css` → replaced by inline input in `ShoppingListDetail`
- `ShoppingList.tsx` / `.css` → replaced by inline item list in `ShoppingListDetail`
- `ShoppingEditPage.tsx` / `.css` → replaced by inline expand-to-edit
- `ShoppingPage.tsx` / `.css` → replaced by `ShoppingListDetail.tsx`

---

## Appendix: Dependency Graph

```
Step 1 (data model + store)
  └─ Step 2 (ShoppingItem with inline edit) ← depends on store actions
       └─ Step 3 (ShoppingListDetail) ← depends on ShoppingItem component
            └─ Step 4 (ShoppingOverview) ← depends on Step 1 (selectors)
                 └─ Step 5 (barcode) ← depends on Step 3 (detail page integration)
                      └─ Step 6 (Firebase sharing) ← depends on all steps
```

Steps 3 and 4 are independent once Step 1 and 2 are done — they can be built
in parallel.

---

## Appendix: NPM Dependencies

- `@zxing/library` (Step 5)
- `firebase` (Step 6)
