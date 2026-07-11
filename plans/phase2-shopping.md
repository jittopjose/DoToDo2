# Phase 2 — Shopping List Feature Enhancements

## Overview

Phase 1 built the foundation: lists, items, barcode scanning. Phase 2 makes the app
**useful at the store** and **smarter over time** — with store mode, categories,
sorting, templates, recent products, and real-time sharing via Firebase.

**Design constraints** (unchanged from Phase 1):
- Shopping lists are `DoTodo` entries with `itemType: 'shopping'` and `shoppingItems: ShoppingItem[]`
- Prefer Ionic components over custom CSS
- All prices formatted with selected currency from settings
- System-preference dark mode only (no in-app toggle)
- Shadow-only containers, `border-left` accent bar, `--border-radius: 0 12px 12px 0`
- Per-type independent UI directories (`shared/`, `shopping/`, etc.)

---

## Step 1 — Store Mode (Priority: HIGH)

**Goal**: One-tap "I'm shopping" mode with large tap targets, auto-check on tap,
hide completed items, keep screen awake.

### Files to modify

| File | Change |
|------|--------|
| `ShoppingListDetail.tsx` | Add store-mode toggle button in header; branch rendering when active |
| `ShoppingListDetail.css` | Add store-mode styles (larger rows, bigger checkboxes, bigger text) |
| `ShoppingItem.tsx` | Add `storeMode` prop: disable edit-on-tap, auto-check on tap, no expand/editor |
| `ShoppingItem.css` | Store-mode variant styles (bigger fonts, more padding) |

### Wireframe

```
Normal view:
┌────────────────────────────────────────────┐
│  ← Lists    Weekly Groceries    [🛒] [📦]  │ ← store mode toggle
│                                            │
│  🛒  TOTAL                     $34.50      │
│  ✅ 3 of 6 items                           │
│                                            │
│  ☐ Milk                       ×2    $3.99  │
│  ☑ Eggs                       ×12   $5.99  │
│  ...                                       │

Store mode:
┌────────────────────────────────────────────┐
│  ← Lists    🛒 Shopping...       [📦] [✓]  │ ← "✓ N" count, exit
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  ☐  Milk                         ×2   ││ ← bigger font, bigger tap
│  │      $3.99                            ││
│  ├────────────────────────────────────────┤│
│  │  ☐  Bread                        ×1   ││
│  │      $2.49                            ││
│  ├────────────────────────────────────────┤│
│  │  (no completed items shown)           ││ ← hidden by default
│  └────────────────────────────────────────┘│
│                                            │
│  [Show checked (3)]                        │ ← collapsible at bottom
└────────────────────────────────────────────┘
```

### Behaviour

- **Toggle**: Header icon button (`cartOutline` / `cart`), switches between modes
- **Tap item**: Immediately toggles completion (no expand-to-edit) — single tap, done
- **Hide completed**: Items with `isCompleted === true` are moved below a "Show checked (N)" row (collapsed by default)
- **Screen idle**: `navigator.wakeLock.request('screen')` while store mode is active; release on exit
- **Exit**: Tap store-mode icon again, or back button exits store mode (not the page)
- **Composer**: Hidden in store mode (you don't add items while shopping)
- **Total card**: Hidden in store mode (replaced by the header count)

### Acceptance criteria

- Store-mode icon in header → toggles between normal and shopping view
- Tapping an item in store mode immediately toggles completion (no inline edit)
- Completed items hidden behind collapsible "Show checked" row
- Screen stays on during shopping (wake lock)
- Exit returns to normal view; composer hidden while shopping

---

## Step 2 — Categories within a List (Priority: HIGH)

**Goal**: Group items by store department (Produce, Dairy, Meat, Bakery, etc.)
with collapsible sections. Categories auto-suggested from Open Food Facts on scan.

### Files to create

| File | Purpose |
|------|---------|
| `src/features/shopping/types.ts` | `ShoppingCategory` type + `DEFAULT_CATEGORIES` constant |

### Files to modify

| File | Change |
|------|--------|
| `src/features/shared/types.ts` | Add optional `category` field to `ShoppingItem` |
| `ShoppingListDetail.tsx` | Group items by category with collapsible sections; add category picker to composer & ShoppingItem editor |
| `ShoppingListDetail.css` | Category section styles (group headers, badges) |
| `ShoppingItem.tsx` | Add category selector in expanded editor |
| `ShoppingItem.css` | Category chip styles |
| `src/services/barcode.service.ts` | Extract `categories_tags` from Open Food Facts, map to known categories |

### Data model change

```ts
// In src/features/shared/types.ts
export interface ShoppingItem {
    id: string;
    title: string;
    isCompleted: boolean;
    quantity?: number;
    price?: number;
    category?: string;   // NEW — references a ShoppingCategory key
}
```

```ts
// New file: src/features/shopping/types.ts
export interface ShoppingCategory {
    key: string;
    label: string;
    icon: string;
    color: string;
}

export const DEFAULT_CATEGORIES: ShoppingCategory[] = [
    { key: 'produce',   label: 'Produce',      icon: 'leafOutline',                 color: '--ion-color-success' },
    { key: 'dairy',     label: 'Dairy & Eggs',  icon: 'eggOutline',                 color: '--ion-color-warning' },
    { key: 'meat',      label: 'Meat & Fish',   icon: 'fishOutline',                color: '--ion-color-danger' },
    { key: 'bakery',    label: 'Bakery',        icon: 'pizzaOutline',               color: '--ion-color-tertiary' },
    { key: 'frozen',    label: 'Frozen',        icon: 'snowOutline',                color: '--ion-color-primary' },
    { key: 'beverages', label: 'Beverages',     icon: 'cafeOutline',                color: '--ion-color-secondary' },
    { key: 'pantry',    label: 'Pantry',        icon: 'layersOutline',              color: '--ion-color-medium' },
    { key: 'household', label: 'Household',     icon: 'homeOutline',                color: '--ion-color-tertiary' },
    { key: 'other',     label: 'Other',         icon: 'ellipsisHorizontalOutline',  color: '--dotodo-muted' },
];
```

### Categories mapping from Open Food Facts

```ts
const CATEGORY_MAP: Record<string, string> = {
    'en:fruits': 'produce',
    'en:vegetables': 'produce',
    'en:dairies': 'dairy',
    'en:eggs': 'dairy',
    'en:meats': 'meat',
    'en:fish': 'meat',
    'en:bread': 'bakery',
    'en:frozen-foods': 'frozen',
    'en:beverages': 'beverages',
    'en:drinks': 'beverages',
    // more mappings added as needed
};
```

### Wireframe

```
┌── PRODUCE ──────────────────────────────── ▼ ──┐
│  ☐ Avocado                            ×2 $1.50  │
│  ☐ Bananas                            ×1 $0.89  │
└──────────────────────────────────────────────────┘
┌── DAIRY & EGGS ────────────────────────── ▼ ──┐
│  ☑ Eggs                              ×12 $5.99  │
│  ☐ Milk                               ×2 $3.99  │
└──────────────────────────────────────────────────┘
┌── PANTRY ─────────────────────────────── ▼ ──┐
│  ☐ Pasta                              ×2 $2.49  │
│  ☐ Olive Oil                          ×1 $8.99  │
└──────────────────────────────────────────────────┘
```

### Behaviour

- **Default**: Items without a category go into an "Other" (uncategorized) section
- **Composer**: Category selector chip row below the price/qty extras (horizontal scroll, small chips)
- **Edit item**: Category chip added to the expanded editor, tap to change
- **Store mode**: Categories still apply (helps you navigate the store by section)
- **Sort**: Categories respect the sort order (Step 3) but items are grouped visually

### Acceptance criteria

- New item can be assigned a category at add-time
- Existing item category can be changed in the expanded editor
- List shows items grouped by category with collapsible group headers
- Uncategorized items appear in "Other" section
- Barcode scan auto-assigns category from Open Food Facts `categories_tags`

---

## Step 3 — Sort Items (Priority: HIGH)

**Goal**: Sort items by name, price, checked/unchecked, or custom drag-reorder.

### Files to modify

| File | Change |
|------|--------|
| `ShoppingListDetail.tsx` | Add sort control in header; pass sorted items to list; add drag-reorder on custom sort |
| `ShoppingListDetail.css` | Sort button styles |
| `src/features/shared/store/doTodoStore.ts` | Add `reorderShoppingItems` action |

### Sort modes

| Mode | Behaviour |
|------|-----------|
| `custom` (default) | Manual drag-reorder — items stay where the user placed them |
| `name-asc` | Alphabetical A–Z |
| `name-desc` | Alphabetical Z–A |
| `price-asc` | Cheapest first (items with no price sort last) |
| `price-desc` | Most expensive first |
| `checked-last` | Unchecked first, then checked |
| `checked-first` | Checked first, then unchecked |

### Sort control

A sort button in the header opens a popover or action sheet listing all sort modes.
The active mode is shown with a checkmark.

### Store action

```ts
reorderShoppingItems: (listId: string, fromIndex: number, toIndex: number) => void;
```

This modifies the `shoppingItems` array in-place (splice + insert). It's only meaningful
when sort mode is `custom` — other modes recompute order deterministically.

### Behaviour

- Default sort mode: `custom` (insertion order, respects drag-reorder)
- Changing sort mode re-renders items in sorted order
- Items return to `custom` order when mode switches back (original insertion order preserved)
- Drag-reorder is only active in `custom` mode (shows drag handles via `IonReorderGroup`)
- In store mode, `checked-last` is auto-applied as the default
- Sort state is local to the page (not persisted per list)

### Acceptance criteria

- Sort button visible in header, tap shows sort mode picker
- Items reorder by selected sort mode
- Drag handles visible in `custom` mode, reorder persists through save
- Store mode auto-sets `checked-last`

---

## Step 4 — Templates / Recurring Lists (Priority: MEDIUM)

**Goal**: Save a shopping list as a template. Create a new list from a template.
Schedule a list to auto-create on a recurring basis.

### Files to create

| File | Purpose |
|------|---------|
| `src/features/shopping/components/TemplatePicker.tsx` | Modal for selecting a template when creating a list |
| `src/features/shopping/components/TemplatePicker.css` | Template picker styles |

### Files to modify

| File | Change |
|------|--------|
| `ShoppingOverview.tsx` | Add "From template" option in create-list area; add template badge on list cards |
| `ShoppingOverview.css` | Template badge styles |
| `src/features/shared/types.ts` | Add optional `templateId`, `isTemplate`, and `recurrence` to `DoTodo` (reuse existing `Recurrence` type) |
| `src/features/shared/store/doTodoStore.ts` | Add `saveAsTemplate`, `getTemplates`, `createFromTemplate` actions; `selectTemplateLists` selector |

### Data model

```ts
// Extended on DoTodo (optional fields):
//   templateId?: string;    // if created from a template
//   isTemplate?: boolean;   // if this entry IS a template (hidden from active lists)
//   recurrence?: Recurrence; // reuse existing Recurrence type from types.ts
```

Templates are stored in IndexedDB alongside regular entries (via the same persistence
mechanism). They are filtered out of `selectActiveShoppingLists` and `selectArchivedShoppingLists`
by checking `isTemplate === true`.

### Behaviour

- **Save as template**: Long-press or swipe on a list card → "Save as template"
- **Create from template**: In ShoppingOverview, "New from template…" option opens `TemplatePicker`
  modal showing saved templates. Selecting one calls `createFromTemplate(templateId, title)` which
  deep-clones the template's `shoppingItems` into a new list
- **Template card**: Visually distinct in overview (dashed border, "Template" badge, not in
  Active/Archived sections — shown in a dedicated "Templates" section above the create card)
- **Recurring**: When creating from template, option to set recurrence (e.g., every Monday).
  At app launch, a simple date check creates new lists from any recurring templates whose
  schedule has elapsed — no background timers needed
- **Recurrence config**: Reuses the existing `Recurrence` type (`frequency`, `interval`,
  `weekdays`, `endType`, `endDate`). A recurrence configuration section is shown in the
  template picker modal

### Acceptance criteria

- Can save any list as a template
- Creating a new list offers "from template" flow
- Template lists are visually distinct (dashed border, badge)
- Recurring lists auto-create on schedule (checked at app open)

---

## Step 5 — Recent Products / Quick-Add from History (Priority: MEDIUM)

**Goal**: Show the last 10–15 scanned/added products as quick-add chips when the
composer input is focused and empty.

### Files to create

| File | Purpose |
|------|---------|
| `src/features/shopping/store/recentProductsStore.ts` | Zustand store for recent products (capped at 15, persisted to localStorage) |

### Files to modify

| File | Change |
|------|--------|
| `ShoppingListDetail.tsx` | Add recent-products chip row above/below composer when input is empty and focused |
| `ShoppingListDetail.css` | Recent-products chip row styles |

### RecentProduct type

```ts
interface RecentProduct {
    title: string;
    lastUsed: number;    // timestamp
    useCount: number;    // how many times added
}
```

### Store

A small standalone Zustand store (persisted via `zustand/middleware/persist` to localStorage):

```ts
interface RecentProductsState {
    products: RecentProduct[];
    recordUsage: (title: string) => void;  // upsert, increment useCount, cap at 15
    clearHistory: () => void;
}
```

### Behaviour

- Products are recorded whenever an item is added to any list (global, not per-list)
- Max 15 items; evicts least-recently-used on overflow
- Duplicates increment `useCount` and update `lastUsed`
- Chips sorted by `lastUsed` descending
- Tapping a chip fills the composer input with the product name
- Only shown when: composer input is focused AND empty AND recent products exist
- Add callback: `ShoppingListDetail` calls `recordUsage(item.title)` after `addShoppingItem` succeeds

### Acceptance criteria

- Recently added products appear as chips below the composer
- Tapping a chip fills the input
- Max 15 items, LRU eviction on overflow
- Duplicates increment usage count
- Persisted across app restarts

---

## Step 6 — Real-Time Sharing via Firebase (Priority: LOW)

**Goal**: Real-time sync so two people can edit a shopping list simultaneously.
(Moved from Phase 1, where it was Step 6.)

### Files to create

| File | Purpose |
|------|---------|
| `src/services/firebase.service.ts` | Initialize Firebase app, Firestore, anonymous auth |
| `src/services/share.service.ts` | Invite code generation, Firestore ↔ Zustand bidirectional merge |

### Files to modify

| File | Change |
|------|--------|
| `ShoppingListDetail.tsx` | Add Share button in header; show invite code in modal |
| `ShoppingOverview.tsx` | Show "shared with N" indicator on list cards; "Joined lists" section |
| `dotodo2.apparmor` | Add `"network"` and `"network-status"` policy groups |
| `package.json` | Add `firebase` dependency |

### New components

| File | Purpose |
|------|---------|
| `JoinListModal.tsx` | (new) Modal to enter an invite code and join a shared list |
| `ShareModal.tsx` | (new) Modal showing invite code + QR for sharing |

### Firebase setup

```
npm install firebase
```

Firebase config injected at build time via environment variables (`VITE_FIREBASE_API_KEY`,
`VITE_FIREBASE_PROJECT_ID`, etc.) — set in `.env` or `capacitor.config.ts`.

### Firestore schema

| Collection | Document | Contents |
|------------|----------|----------|
| `list-shares/{listId}` | Per-list share metadata | `{ inviteCode, ownerId, sharedWith: string[] }` |
| `shopping-lists/{listId}` | Full `DoTodo` JSON | Written by owner, read by shared users |
| `shopping-lists/{listId}/items/{itemId}` | Individual `ShoppingItem` | Bidirectional sync — subcollection for per-item granularity |

### Architecture

```
User taps Share on ShoppingListDetail
  → Firebase anonymous auth (silent, auto-initialized)
  → Generate random 6-char invite code
  → Upsert to /list-shares/{listId} (idempotent)
  → Show code + QR in ShareModal

Remote user enters invite code in JoinListModal
  → Query /list-shares by inviteCode
  → Subscribe to /shopping-lists/{listId} onSnapshot
  → Subscribe to /shopping-lists/{listId}/items onSnapshot
  → Merge incoming writes into Zustand (overwrite matching list entry)
  → debounce(1000) local Zustand changes → write to Firestore

Owner can revoke → remove uid from sharedWith → onSnapshot unsubscribe remote
```

### Conflict resolution

- **Per-field merge**: `set({...}, { merge: true })` preserves non-conflicting fields
  when two users edit different fields of the same item simultaneously
- **Ownership**: Owner can revoke shares; shared users can edit items but not delete
  the list itself or change sharing settings
- **Offline**: Firestore's built-in offline persistence handles temporary disconnects
- **Debounce**: Local writes debounced 1s to avoid excessive Firestore writes during
  rapid editing (e.g., checking off items)

### Acceptance criteria

- Tap Share on a list → shows invite code + QR
- Another device enters invite code → both see the same list with real-time updates
- Adding/editing/toggling items syncs bidirectionally in real-time (<2s delay)
- Conflicting edits don't lose data (per-field merge)
- Shared lists show a "shared" indicator in the overview
- Owner can revoke access; revoked users get disconnected
- Works offline (queues changes, syncs on reconnect)

### Non-goals

- No presence indicators ("User X is typing") — too complex for v1
- No rich-text collaboration (only simple field edits)
- No conflict resolution UI — last-writer-wins per field is sufficient

---

## Dependency Graph

```
Step 1 (Store mode) — UI only, no data model changes
   └─ independent

Step 2 (Categories) — requires category field on ShoppingItem
   └─ composes with Step 1 (categories visible in store mode)
   └─ composes with Step 3 (categories + sort work together)

Step 3 (Sort) — requires reorderShoppingItems action
   └─ Step 1 auto-sets checked-last in store mode

Step 4 (Templates) — requires isTemplate/templateId/recurrence on DoTodo
   └─ independent of Steps 1-3
   └─ ShoppingOverview changes independent of detail page changes

Step 5 (Recent products) — new standalone store, taps into addShoppingItem
   └─ independent of Steps 1-4 (composer area change only)
   └─ ShoppingListDetail changes small and non-conflicting

Step 6 (Sharing) — Firebase, entirely independent data flow
   └─ touches ShoppingListDetail (share button) + ShoppingOverview (badges)
   └─ no data model conflicts with Steps 1-5
```

## Recommended implementation order

```
1 → 3 → 2 → 5 → 4 → 6
```

Each step builds naturally: store mode is quick and high-impact, sort is small,
categories is the most involved UI change, recent products is a standalone store,
templates touches overview layout, and sharing slots cleanly at the end.

Steps 1, 3, and 5 can be implemented in parallel if desired (they touch different
parts of the detail page with minimal merge conflict risk).

---

## Appendix: Route Map

| Route | Page | Phase |
|-------|------|-------|
| `/shopping` | `ShoppingOverview` | Phase 1 ✅ |
| `/shopping/:listId` | `ShoppingListDetail` | Phase 1 ✅ |
| `/shopping/:listId/share` | `ShareModal` (in-page modal, not route) | Phase 2 Step 6 |

---

## Appendix: NPM Dependencies

Status | Package | Step
-------|---------|------
❌ Not added | `firebase` | Phase 2 Step 6

---

## Appendix: File Tree After Phase 2

```
src/features/shared/
├── types.ts                            ← + category on ShoppingItem, + isTemplate/templateId/recurrence on DoTodo
└── store/
    └── doTodoStore.ts                  ← + reorderShoppingItems, + saveAsTemplate/getTemplates/createFromTemplate

src/features/shopping/
├── components/
│   ├── ScannerOverlay.tsx
│   ├── ScannerOverlay.css
│   ├── ShoppingItem.tsx                ← + storeMode prop, + category selector in editor
│   ├── ShoppingItem.css                ← + store-mode variants, + category chip
│   ├── TemplatePicker.tsx              ← NEW
│   └── TemplatePicker.css              ← NEW
├── pages/
│   ├── ShoppingListDetail.tsx          ← + store mode, + categories, + sort, + recent products, + share button
│   ├── ShoppingListDetail.css          ← + store mode, + categories, + sort, + recents styles
│   ├── ShoppingOverview.tsx            ← + templates section, + shared badges, + join list
│   └── ShoppingOverview.css            ← + template badge, + shared indicator
├── services/
│   └── barcode.service.ts              ← + category mapping from Open Food Facts
├── store/
│   └── recentProductsStore.ts          ← NEW
└── types.ts                            ← NEW: ShoppingCategory + DEFAULT_CATEGORIES

src/services/
├── barcode.service.ts                  ← (already exists)
├── firebase.service.ts                 ← NEW
└── share.service.ts                    ← NEW
```

---

## Appendix: Design System Refs

All Phase 2 features follow the existing design system from `DESIGN.md` and
Phase 1 conventions (see `phase1-shopping.md` appendix). Key reminders:

- Group headers match the TodoList pattern (icons, badges, collapsible chevron)
- Cards use `box-shadow` only, `border-left` accent, `--border-radius: 0 12px 12px 0`
- Composer matches TodoInput pattern (grid layout, pill buttons, 10px 14px padding)
- All prices formatted via `formatPrice()` with settings currency
- Prefer Ionic components (IonButton, IonChip, IonPopover, IonModal, IonReorderGroup)
  over custom CSS
