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
- Drag-reorder uses pointer events + `setPointerCapture` + `elementFromPoint` (not `IonReorderGroup` — the wrapper div structure with `overflow: hidden` and custom `border-radius` clips Ionic's reorder clone animation, and the dual `slot="start"` elements conflict)

---

## Step 1 — Store Mode (Priority: HIGH) ✅ DONE

**Goal**: One-tap "I'm shopping" mode with large tap targets, auto-check on tap,
hide completed items, keep screen awake.

### Files to modify

| File | Change |
|------|--------|
| `ShoppingListDetail.tsx` | Add store-mode toggle button in header; branch rendering when active; outline pill CTA button ("Start/Continue shopping"); `IonFooter` with progress bar for exit |
| `ShoppingListDetail.css` | Store-mode styles (larger rows, bigger checkboxes, bigger text); pill button outline styles; footer + progress bar styles |
| `ShoppingItem.tsx` | Add `storeMode` prop: disable edit-on-tap, auto-check on tap, no expand/editor |
| `ShoppingItem.css` | Store-mode variant styles (bigger fonts, more padding) |

### Wireframe

```
Normal view:
┌────────────────────────────────────────────┐
│  ← Lists    Weekly Groceries    [🛒] [📦]  │ ← store mode toggle (header)
│                                            │
│  🛒  TOTAL                     $34.50      │
│  ✅ 3 of 6 items                           │
│                                            │
│  ☐ Milk                       ×2    $3.99  │
│  ☑ Eggs                       ×12   $5.99  │
│  ...                                       │
│                                            │
│  ┌── 🛒  Start shopping ──────────────────┐│ ← tertiary outline pill, 16px
│  └─────────────────────────────────────────┘│    "Continue shopping" if checked
│                                             │    items exist

Store mode:
┌────────────────────────────────────────────┐
│  ← Lists    🛒 5 items left      [🛒] [📦]  │ ← header: item count
│                                            │
│  ☐  Milk                         ×2        │
│      $3.99                                 │
│                                            │
│  ☐  Bread                        ×1        │
│      $2.49                                 │
│                                            │
│  ↑ Show checked (3)                        │ ← collapsible
│                                            │
├────────────────────────────────────────────┤ ← border-top
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░   (50%)      │ ← 4px tertiary progress bar
│  🛒  3 of 6 items                [Exit]   │ ← IonFooter, 56px, 16px pad
└────────────────────────────────────────────┘
```

### Behaviour

- **Toggle**: Header icon button (`cartOutline` / `cart`) switches modes; also toggled by CTA pill button (entry) and Exit button in footer (exit)
- **Entry CTA**: Outline tertiary pill button (`IonButton fill="outline"`) shown below composer when items exist & not in store mode. Label is "Start shopping" (none checked) or "Continue shopping" (≥1 checked), 16px horizontal padding
- **Tap item**: Immediately toggles completion (no expand-to-edit) — single tap, done
- **Hide completed**: Items with `isCompleted === true` moved below "Show checked (N)" row (collapsed by default)
- **Screen idle**: `navigator.wakeLock.request('screen')` while active; release on exit
- **Exit**: Footer "Exit" button, header cart icon, or back button — all exit mode
- **Composer**: Hidden in store mode (you don't add items while shopping)
- **Total card**: Hidden in store mode (replaced by footer progress bar + header count)
- **Footer bar**: `IonFooter` pinned at page bottom outside `IonContent`; 4px tertiary progress bar at top (width = completion %), cart icon + "N of M items" label + outline Exit button below; 56px tall with 16px horizontal padding

### Acceptance criteria

- Store-mode icon in header + entry pill + footer bar toggle store mode
- Tapping an item in store mode immediately toggles completion (no inline edit)
- Completed items hidden behind collapsible "Show checked" row
- Screen stays on during shopping (wake lock)
- Footer progress bar reflects checked/total ratio
- "Start shopping" / "Continue shopping" label adapts dynamically
- Exit footer pinned at bottom, visually aligned with content (16px padding)

---

## Step 2 — Categories within a List (Priority: HIGH) ✅ DONE (with design changes)

**Goal**: Group items by store department (Produce, Dairy, Meat, Bakery, etc.)
with minimal visual grouping. Categories auto-suggested from Open Food Facts on scan.

### Files to create

| File | Purpose |
|------|---------|
| `src/features/shopping/types.ts` | `ShoppingCategory` type + `DEFAULT_CATEGORIES` constant |

### Files to modify

| File | Change |
|------|--------|
| `src/features/shared/types.ts` | Add optional `category` field to `ShoppingItem` |
| `ShoppingListDetail.tsx` | Group items by category with minimal "aisle sign" headers; add category `IonSelect` in composer extras & ShoppingItem editor |
| `ShoppingListDetail.css` | Category group header styles (`.shop-category-minimal-header`, `.shop-category-minimal-label`) — 11px uppercase muted label, no backgrounds, no icons, no chevrons |
| `ShoppingItem.tsx` | Add category `IonSelect` in expanded editor; **no `showCategory` prop, no category chip on item** |
| `ShoppingItem.css` | Category editor styles (`.shop-editor-category`); **no `.shop-item-category-chip`** |
| `src/services/barcode.service.ts` | Extract `categories_tags` from Open Food Facts, map to known categories via `CATEGORY_MAP` |

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
}

export const DEFAULT_CATEGORIES: ShoppingCategory[] = [
    { key: 'produce',   label: 'Produce',      icon: 'leafOutline' },
    { key: 'dairy',     label: 'Dairy & Eggs',  icon: 'eggOutline' },
    { key: 'meat',      label: 'Meat & Fish',   icon: 'fishOutline' },
    { key: 'bakery',    label: 'Bakery',        icon: 'pizzaOutline' },
    { key: 'frozen',    label: 'Frozen',        icon: 'snowOutline' },
    { key: 'beverages', label: 'Beverages',     icon: 'cafeOutline' },
    { key: 'pantry',    label: 'Pantry',        icon: 'layersOutline' },
    { key: 'household', label: 'Household',     icon: 'homeOutline' },
    { key: 'other',     label: 'Other',         icon: 'ellipsisHorizontalOutline' },
];
```

> **Note**: `ShoppingCategory` has `key`, `label`, and `icon` only. The `color` field from the original plan was dropped — category is communicated only through section headers, not per-item chips or color accents.

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

### Wireframe (as implemented — minimal "aisle sign" headers)

```
PRODUCE                                                    (11px uppercase, muted)
  ☐ Avocado                            ×2 $1.50
  ☐ Bananas                            ×1 $0.89

DAIRY & EGGS
  ☑ Eggs                              ×12 $5.99
  ☐ Milk                               ×2 $3.99

PANTRY
  ☐ Pasta                              ×2 $2.49
  ☐ Olive Oil                          ×1 $8.99
```

Section headers are plain text labels — no background card, no icon, no chevron, no collapsibility.
This applies uniformly in store mode (where categories help navigate the store by section)
and in grouped non-custom sort modes.

### Behaviour

- **Default**: Items without a category go into an "Other" (uncategorized) section
- **Composer**: Category `IonSelect` (with `interface="popover"`), available in the "show more" extras area alongside qty stepper + price input
- **Edit item**: Category `IonSelect` in the expanded editor's save panel
- **Category NOT shown on item cards**: No category chip, dot, or color stripe on individual items — the only visual indicator of category is the section header above a group. This keeps item rows clean and avoids crowding, especially in custom (ungrouped) mode
- **Grouping applies in**: all non-custom sort modes + store mode. In `custom` sort mode, items are flat (no headers, no grouping) and drag-reorder is active
- **Store mode**: Categories still apply (helps you navigate the store by section)
- **Sort**: Categories respect the sort order (Step 3) but items are grouped visually
- **Not collapsible**: Section headers are static labels only — no expand/collapse toggle

### Acceptance criteria

- ✅ New item can be assigned a category at add-time
- ✅ Existing item category can be changed in the expanded editor
- ✅ List shows items grouped by category with minimal text-only headers (ungrouped in `custom` mode)
- ✅ Uncategorized items appear in "Other" section
- ✅ Barcode scan auto-assigns category from Open Food Facts `categories_tags`
- ✅ No per-item category chip — category visible only through section headers + editor

---

## Step 3 — Sort Items (Priority: HIGH) ✅ DONE

**Goal**: Sort items by name, price, checked/unchecked, or custom drag-reorder.

### Files to modify

| File | Change |
|------|--------|
| `ShoppingListDetail.tsx` | Add sort control in header via `IonActionSheet`; pass sorted items to list via `useMemo`; add pointer-event-based drag-reorder on custom sort |
| `ShoppingListDetail.css` | Sort button active state styles (`--color: var(--ion-color-tertiary)`) |
| `ShoppingItem.tsx` | Accept `showReorder`, `dragOver`, `onDragHandlePointerDown` props; render drag handle icon with `touch-action: none` |
| `ShoppingItem.css` | Drag handle styles (`.shop-item-drag-handle` with `cursor: grab`, `touch-action: none`); `.is-drag-over` highlight (tertiary `border-top`) |
| `src/features/shared/store/doTodoStore.ts` | Add `reorderShoppingItems` action (accepts array of item IDs); `addShoppingItem` defaults `quantity` to 1 when omitted |

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

A funnel icon button in the header opens an `IonActionSheet` listing all 7 sort modes.
The active mode is shown with a checkmark. When a non-custom mode is active, the
funnel icon turns tertiary (teal) via `.shop-header-sort-active` CSS class.

### Store action

```ts
reorderShoppingItems: (listId: string, itemIds: string[]) => void;
```

Accepts a full array of item IDs in the desired order. The store rebuilds the
`shoppingItems` array by mapping IDs back to item objects (with type-safe filtering).
This was changed from the original `(fromIndex, toIndex)` signature to support
live reorder during drag-over events.

### Drag-reorder implementation (pointer events)

`IonReorderGroup` was not viable — the `div.shop-item-wrap` wrapper with
`overflow: hidden` and `border-radius` clips Ionic's reorder clone animation,
and the dual `slot="start"` elements (handle + checkbox) compete for layout.
Instead, a custom pointer-event system is used:

1. **`onPointerDown` on drag handle** — calls `e.preventDefault()` + `setPointerCapture(e.pointerId)`. Capturing redirects all subsequent pointer events (move/up) to the handle even when the pointer leaves it.
2. **`pointermove` on `document`** (via `useEffect` mount/unmount when `dragging` state is true) — uses `document.elementFromPoint(e.clientX, e.clientY)` to find what's under the pointer, then `el.closest('[data-shop-item-index]')` walks up to the wrapper whose `data-shop-item-index` attribute was set during render.
3. **Live reorder** — each `pointermove` computes the new ID array, calls `reorderShoppingItems`, and updates `dragListRef.current` synchronously (avoiding stale-closure bugs from React's async render cycle).
4. **`pointerup` cleanup** — sets `dragging` to `false`, unregisters document listeners via the `useEffect` cleanup.

Key refs:
- `dragFromRef` — tracks the current index of the dragged item (changes as items swap beneath it)
- `dragListRef` — mirrors the current ID order, updated synchronously on each move
- `dragOverIdx` (state) — drives the `.is-drag-over` CSS class (tertiary border-top indicator)

### Behaviour

- Default sort mode: `custom` (insertion order, respects drag-reorder)
- Changing sort mode re-renders items in sorted order
- Items return to `custom` order when mode switches back (original insertion order preserved)
- Drag-reorder is only active in `custom` mode (shows drag handle icon, enables pointer capture)
- In store mode, `checked-last` is auto-applied on entry, reset to `custom` on exit
- Sort state is local to the page (not persisted per list)

### Acceptance criteria

- ✅ Sort button visible in header, tap shows sort mode picker with checkmark
- ✅ Items reorder by selected sort mode via `useMemo` + `sortedItems`
- ✅ Drag handles visible in `custom` mode, reorder persists through save
- ✅ Store mode auto-sets `checked-last`
- ✅ Drag-reorder works on both mouse and touch (pointer events, not HTML5 DnD)
- ✅ Tapping item body still opens editing (drag only initiates from handle)

---

## Step 4 — Templates / Recurring Lists (Priority: MEDIUM) 🔶 PARTIAL

**Goal**: Save a shopping list as a template. Create a new list from a template.
Schedule a list to auto-create on a recurring basis.

> **Status — as of 2026-07-18**: Template save, template picker modal, "from template"
> creation, and per-list recurrence configuration are **implemented**. The launch-time
> auto-generation of recurring lists is **NOT yet implemented** (see gap below).

### Files to create

| File | Purpose |
|------|---------|
| `src/features/shopping/components/TemplatePickerModal.tsx` | Modal for selecting a template + naming the new list + choosing recurrence |
| `src/features/shopping/components/TemplatePickerModal.css` | Template picker styles (card grid, icons, animations, recurrence badge) |

> The actual component is named `TemplatePickerModal` (the original plan said
> `TemplatePicker`). The modal also carries the recurrence chooser for the new list.

### Files to modify

| File | Change |
|------|--------|
| `ShoppingOverview.tsx` | "From template" button in create area; dedicated collapsible "Templates" group with template cards (dashed border + "Template" `IonChip` badge); long-press action sheet with "Save as template" |
| `ShoppingOverview.css` | Template card + badge + group styles |
| `src/features/shared/types.ts` | `templateId`, `isTemplate`, and `recurrence` added to `DoTodo` (reuse existing `Recurrence` type) |
| `src/features/shared/store/doTodoStore.ts` | `saveAsTemplate`, `getTemplates`/`selectTemplates`, `createFromTemplate` actions; templates filtered out of active/archived selectors via `isTemplate === true` |
| `ShoppingListDetail.tsx` | Repeat control now uses `ShoppingRepeatCard` (inline expandable card — see redesign note) |
| `src/features/shopping/components/ShoppingRepeatCard.tsx` (new) | Inline expandable repeat editor (collapsed summary → expanded editor with freq chips, weekday row, custom stepper + `IonSelect` unit dropdown, inline `IonDatetime` end-date, next-occurrence preview, Remove) |
| `src/features/shopping/components/ShoppingRepeatCard.css` (new) | Repeat card styles (tertiary teal-green accent to match shopping theme) |

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

- **Save as template**: Long-press (card action sheet) on a list card → "Save as template"
  calls `saveAsTemplate(listId)`. The template **preserves** the source list's recurrence
  (it is no longer stripped), so a recurring template stays recurring.
- **Create from template**: In ShoppingOverview, "From template" button opens
  `TemplatePickerModal` showing saved templates (cards with icon, item preview, category
  chips, recurrence badge, selection glow). Selecting one + entering a list name + optional
  recurrence calls `createFromTemplate(templateId, title, recurrence)`, which deep-clones the
  template's `shoppingItems` into a new list. If the template itself has a recurrence, it is
  pre-filled into the modal's recurrence chooser.
- **Template card**: Visually distinct in overview (dashed border, "Template" badge, not in
  Active/Archived sections — shown in a dedicated "Templates" group above the create card).
  Tapping a template card opens the picker pre-focused on that template.
- **Recurring (assignment)**: Recurrence is chosen at creation time in the modal (and editable
  later via `ShoppingRepeatCard` on the detail page). `frequency`, `interval`, `weekdays`,
  `endType`, `endDate`, `originDate` reuse the existing `Recurrence` type.
- **Recurring (auto-create)**: ⚠️ **NOT IMPLEMENTED.** The plan called for a launch-time date
  check that auto-creates new lists from recurring templates whose schedule has elapsed. No
  such logic exists — `createFromTemplate` is only invoked manually from the modal. This is the
  remaining Step 4 gap.

### Repeat control redesign (post-implementation note)

The original plan assumed a recurrence configuration section inside the template picker and a
popover-based repeat editor on the detail page. Both were redesigned:

- The detail-page repeat editor is now `ShoppingRepeatCard` — a self-contained inline expandable
  card (collapsed shows "Repeats: <summary>" + next occurrence; tap expands the full editor).
  End date uses an inline `IonDatetime`, not a nested popover.
- The task edit screen's `RepeatSection` was later restyled to mirror `ShoppingRepeatCard`
  (collapsed→expanded card, same chips/stepper/preview/remove visuals), keeping its primary
  purple accent.
- Theme: shopping repeat card uses tertiary teal-green (`--ion-color-tertiary`) to match the
  shopping list; task repeat section uses primary purple.

### Acceptance criteria

- ✅ Can save any list as a template (long-press → action sheet)
- ✅ Creating a new list offers "from template" flow (`TemplatePickerModal`)
- ✅ Template lists are visually distinct (dashed border, badge, dedicated Templates group)
- ⚠️ Recurring lists auto-create on schedule (checked at app open) — **NOT IMPLEMENTED** (manual creation only)

---

## Step 5 — Recent Products / Quick-Add from History (Priority: MEDIUM) ✅ DONE

**Goal**: Show the last 15 scanned/added products as quick-add chips that filter as
the user types. Tapping a chip fills the input.

### Files to create

| File | Purpose |
|------|---------|
| `src/features/shopping/store/recentProductsStore.ts` | Zustand store for recent products (capped at 15, persisted to localStorage) |

### Files to modify

| File | Change |
|------|--------|
| `ShoppingListDetail.tsx` | Add recent-products chip row below composer; filter chips by typed text via `useMemo`; call `recordUsage` after `addShoppingItem` and barcode scan |
| `ShoppingListDetail.css` | Recent-products chip row styles (`.shop-recent-row`, `.shop-recent-chip`) |

### RecentProduct type

```ts
interface RecentProduct {
    title: string;
    lastUsed: number;    // timestamp
    useCount: number;    // how many times added
    category?: string;   // last-used category key
}
```

### Store

A small standalone Zustand store (persisted via `zustand/middleware/persist` to localStorage):

```ts
interface RecentProductsState {
    products: RecentProduct[];
    recordUsage: (title: string, category?: string) => void;  // upsert, increment useCount, cap at 15, store category
    clearHistory: () => void;
}
```

### Behaviour

- Products are recorded whenever an item is added to any list (global, not per-list)
- Max 15 items; evicts least-recently-used on overflow
- Duplicates increment `useCount`, update `lastUsed`, and merge `category` (last-used category wins)
- Chips sorted by `lastUsed` descending
- Tapping a chip fills the composer input **and** auto-selects the stored category (user presses Enter or + to confirm — does NOT auto-submit)
- **Chips filter as user types**: when input is focused, chips narrow to case-insensitive substring matches of the typed text. Empty input shows all. Row hides when no matches or input loses focus
- `recordUsage` called after `addShoppingItem` (passes `newItemCategory`), after barcode scan (passes `product.category`), and when editing an item's category via the editor
- Barcode scan results also recorded in recent products
- Hidden when input has text with no matching products, or input is blurred

### `addShoppingItem` quantity default

When `quantity` is omitted (composer "show more" collapsed), the store defaults it to `1` via `quantity: quantity ?? 1` — every shopping item always has a quantity.

### Acceptance criteria

- ✅ Recently added products appear as chips below composer when input is focused
- ✅ Chips filter by typed text (case-insensitive substring match)
- ✅ Tapping a chip fills the input **and** auto-selects the stored category
- ✅ Max 15 items, LRU eviction on overflow
- ✅ Duplicates increment usage count and update timestamp
- ✅ Persisted across app restarts (localStorage via Zustand persist)
- ✅ Barcode scan results also recorded
- ✅ Category saved alongside product name; last-used category stored per product
- ✅ Editing an item's category updates the recent-product record
- ✅ Adding an item without qty defaults to 1

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
Step 1 (Store mode) — UI only, no data model changes ✅ DONE
   └─ independent

Step 2 (Categories) — requires category field on ShoppingItem ✅ DONE
    └─ composes with Step 1 (categories visible in store mode)
    └─ composes with Step 3 (categories + sort work together)
    └─ design change: minimal text-only headers (no collapsible, no chips) — see Step 2 details

Step 3 (Sort) — requires reorderShoppingItems action ✅ DONE
   └─ Step 1 auto-sets checked-last in store mode

Step 4 (Templates) — requires isTemplate/templateId/recurrence on DoTodo 🔶 PARTIAL
    └─ independent of Steps 1-3
    └─ Save/create/badge done; launch-time recurring auto-create NOT done

Step 5 (Recent products) — new standalone store, taps into addShoppingItem ✅ DONE
    └─ independent of Steps 1-4 (composer area change only)
    └─ ShoppingListDetail changes small and non-conflicting
    └─ design change: chips filter by typed text (not only shown when empty) — see Step 5 details

Step 6 (Sharing) — Firebase, entirely independent data flow
   └─ touches ShoppingListDetail (share button) + ShoppingOverview (badges)
   └─ no data model conflicts with Steps 1-5
```

## Recommended implementation order

```
1 → 3 → 2 → 5 → 4 → 6
  ✅    ✅    ✅    ✅
```

Progress: Steps 1, 2, 3, and 5 are complete. Step 2 was redesigned from the original
plan — see Step 2 section for details on the minimal-header approach (no collapsible
sections, no per-item category chips, no color field). Step 5 chips filter by typed
text rather than hiding when non-empty, and now store the last-used category per
product (auto-filled on chip tap). `addShoppingItem` defaults quantity to 1 when
omitted. Step 4 (Templates) is **partially** done: save-as-template, the
`TemplatePickerModal`, "from template" creation, template cards/badges, and the
`ShoppingRepeatCard` inline editor are all implemented; the launch-time recurring
auto-create is the only remaining gap. Next up: finish Step 4 auto-create, or start
Step 6 (Sharing).

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
| (template creation) | `TemplatePickerModal` (in-page modal, not route) | Phase 2 Step 4 |
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
    └── doTodoStore.ts                  ← + reorderShoppingItems, + addShoppingItem(category param, qty defaults to 1), + saveAsTemplate/getTemplates/createFromTemplate

src/features/shopping/
├── components/
│   ├── ScannerOverlay.tsx
│   ├── ScannerOverlay.css
│   ├── ShoppingItem.tsx                ← + storeMode prop, + category IonSelect in editor (no showCategory prop)
│   ├── ShoppingItem.css                ← + store-mode variants, + .shop-editor-category (no .shop-item-category-chip)
│   ├── TemplatePickerModal.tsx         ← NEW (Step 4) — template selection + naming + recurrence
│   ├── TemplatePickerModal.css         ← NEW (Step 4)
│   ├── ShoppingRepeatCard.tsx          ← NEW — inline expandable repeat editor (replaces popover)
│   └── ShoppingRepeatCard.css          ← NEW
├── pages/
│   ├── ShoppingListDetail.tsx          ← + store mode, + categories (minimal headers), + sort, + drag-reorder, + recent products (Step 5), + share button (Step 6)
│   ├── ShoppingListDetail.css          ← + store mode, + .shop-category-minimal-header, + sort, + recents styles
│   ├── ShoppingOverview.tsx            ← + templates section (Step 4), + shared badges (Step 6), + join list (Step 6)
│   └── ShoppingOverview.css            ← + template badge (Step 4), + shared indicator (Step 6)
├── services/
│   └── barcode.service.ts              ← + CATEGORY_MAP from Open Food Facts categories_tags
├── store/
│   └── recentProductsStore.ts          ← NEW (Step 5)
└── types.ts                            ← ShoppingCategory (key/label/icon only, no color) + DEFAULT_CATEGORIES

src/services/
├── barcode.service.ts                  ← (already exists)
├── firebase.service.ts                 ← NEW
└── share.service.ts                    ← NEW
```

---

## Appendix: Design System Refs

All Phase 2 features follow the existing design system from `DESIGN.md` and
Phase 1 conventions (see `phase1-shopping.md` appendix). Key reminders:

- Category group headers are minimal "aisle sign" text labels (11px uppercase, muted, no icons/backgrounds/chevrons). Not collapsible. Only rendered in non-custom sort modes and store mode
- Cards use `box-shadow` only, `border-left` accent, `--border-radius: 0 12px 12px 0`
- Composer matches TodoInput pattern (grid layout, pill buttons, 10px 14px padding)
- All prices formatted via `formatPrice()` with settings currency
- Prefer Ionic components (IonButton, IonChip, IonPopover, IonModal) over custom CSS — however, `IonReorderGroup` is not used for drag-reorder (pointer-event custom implementation instead)
