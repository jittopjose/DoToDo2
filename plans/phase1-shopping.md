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
- Shopping list identified by `itemType === 'shopping'` AND `shoppingItems !== undefined`
- **Shadow-only containers** — all cards use `box-shadow` only, no `border` + shadow mix
- **Cards use `border-left` accent bar** with `--border-radius: 0 12px 12px 0` (flat left edge so the accent bar runs straight)
- **Per-type independent UI directories** — `shared/`, `todo/`, `shopping/`, `note/`, `checklist/`
- **Prefer Ionic components over custom CSS** — audited post-polish to ensure compliance
- **Never commit without user approval** — present diff for review first

---

## Step 1 — Data Model + Store (Priority: HIGH) ✅ DONE

**Goal**: Add `ShoppingItem` type, extend `DoTodo`, add store actions and selectors.

### Files modified

| File | Change |
|------|--------|
| `src/features/shared/types.ts` | Add `ShoppingItem` interface; add `shoppingItems` and `isArchived` to `DoTodo` |
| `src/features/shared/store/doTodoStore.ts` | Add 6 new actions + 4 new selectors. **Critical fix**: `addEntry` no longer overrides `itemType` with `typeFilter`; only todo items get default due date |

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
| `selectShoppingListItems(listId)` | The `shoppingItems` array for a given list |
| `selectShoppingListSummary(listId)` | `{ count, total, completedCount }` from items array |

### Refinements vs original plan
- 4 selectors (not 3) — added `selectShoppingListItems` for convenience

### Acceptance criteria ✅

- TypeScript compiles clean
- Calling `addShoppingList('Weekly Groceries')` creates a store entry with empty items array
- `selectActiveShoppingLists` returns newly created lists
- `selectShoppingListSummary` returns correct counts

### Dependencies

- Zustand store persistence (already wired up — `schedulePersist` runs on store changes, debounced 500ms)
- Default list renamed: `"All Lists"` → `"all-lists"`

---

## Step 2 — ShoppingItem with Inline Expand-to-Edit (Priority: HIGH) ✅ DONE

**Goal**: A single component that displays a shopping item and lets the user
edit it inline by expanding the row.

### Files modified

| File | Action |
|------|--------|
| `src/features/shopping/components/ShoppingItem.tsx` | Rewritten with inline edit, `slot="start"` on checkbox |
| `src/features/shopping/components/ShoppingItem.css` | Rewritten with expand animation; `.shop-item-name` has `flex: 1` + `text-align: left` |

### ShoppingItem — Collapsed state (default)

```
┌────────────────────────────────────────────┐
│  ☐ Milk                       ×2    $3.99  │
└────────────────────────────────────────────┘
```

- Checkbox toggles completion (strikethrough when done) — uses `slot="start"` (was missing initially, fixed)
- Name has `flex: 1` + `text-align: left` for correct alignment
- Quantity badge (`×N`), price chip (`$3.99`)
- Tap anywhere on the body (not checkbox) → expands to edit

### ShoppingItem — Expanded state

```
┌────────────────────────────────────────────┐
│  ☐ Milk                       ×2    $3.99  │
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
- Price input uses dynamic currency symbol from settings (see Step 3a)

### Refinements vs original plan
- No cart icon in the item row (only in the overview list cards)
- Price chip formatting reads `currency` from `useSettingsStore`

### Acceptance criteria ✅

- Item shows name, checkbox, quantity badge, price chip
- Checking the checkbox → strikethrough style
- Tapping the item → expands editor below the summary row
- Editing name/qty/price → Save → collapses with updated values
- Delete → item removed from list
- Smooth expand/collapse animation

---

## Step 3 — Shopping List Detail Page (Priority: HIGH) ✅ DONE

**Goal**: A page showing items in a single shopping list with add-input, total bar, and archive.

### Files created

| File | Purpose |
|------|---------|
| `src/features/shopping/pages/ShoppingListDetail.tsx` | Items in one list |
| `src/features/shopping/pages/ShoppingListDetail.css` | Detail page styles |

### Old files deleted (replaced by this page)
- `ShoppingInput.tsx` / `.css` → replaced by inline input in `ShoppingListDetail`
- `ShoppingList.tsx` / `.css` → replaced by inline item list in `ShoppingListDetail`
- `ShoppingEditPage.tsx` / `.css` → replaced by inline expand-to-edit
- `ShoppingPage.tsx` / `.css` → replaced by `ShoppingListDetail.tsx`
- `Shopping.styles.ts` → replaced by per-component CSS

### Wireframe (actual)

```
┌────────────────────────────────────────────┐
│  ← Lists    Weekly Groceries           📦  │ ← archive button in header
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  🛒  TOTAL                     $34.50  ││ ← dual-stat card
│  │  ✅ 3 of 6 items                      ││
│  └────────────────────────────────────────┘│
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  📝 [What to buy?                 ] [+]││ ← collapsed: text + add
│  │  🔽 Add qty & price                   ││ ← tap to expand extras
│  +────────────────────────────────────────+│
│  │  [−] 1 [+]    $ [0.00    ]             ││ ← expanded: stepper + price
│  └────────────────────────────────────────┘│
│                                            │
│  ☐ Milk                       ×2    $3.99  │
│  ☑ Eggs                       ×12   $5.99  │
│  ☐ Bread                      ×1    $2.49  │
│  ...                                       │
└────────────────────────────────────────────┘
```

### Functionality

| Feature | Detail |
|---------|--------|
| **Add item** | Text + optional qty/price → calls `addShoppingItem` |
| **Toggle item** | Checkbox → calls `toggleShoppingItem` |
| **Edit item** | Tap → sets `editingItemId`, only that item expands |
| **Save edit** | Expand view Save → calls `updateShoppingItem`, clears `editingItemId` |
| **Delete item** | Expand view Delete → calls `removeShoppingItem`, clears `editingItemId` |
| **Archive list** | Header button → calls `archiveShoppingList`, navigates back |
| **Total** | Dual-stat card: total price + "N of M items completed" |
| **Empty state** | "No items yet — add your first item above." |
| **Composer** | Inline (not IonCard) after design audit; collapsed by default with "Add qty & price" toggle |

### Refinements vs original plan
- **No search bar** — deferred (not essential for v1)
- **Composer collapsed by default** — "Add qty & price" toggle instead of always-visible extras
- **Composer styling** — matches TodoInput composer-card pattern (grid layout, 46×46 pill button, 10px 14px padding)
- **Total card** — dual-stat (total price + completion count), not just price
- **Cards** — shadow-only with `border-left` accent, `--border-radius: 0 12px 12px 0`
- **Layout** — horizontal padding unified to 14px, item rows to symmetric 14px
- **Archive** — header button with archive icon, not "tap to unarchive" in overview

### Acceptance criteria ✅

- Navigate to `/shopping/:id` → see the list detail page
- Add items with just a name → appear in list
- Add items with name + qty + price → show quantity badge + price chip
- Checkbox → strikethrough
- Tap to expand → edit inline → save → collapse with updates
- Archive button → list moves to archived, navigates back to overview
- Total bar updates in real-time

---

## Step 3a — Currency Setting (Priority: HIGH) ✅ DONE

**Goal**: Allow users to choose a currency symbol for price display, persisted globally.

### Files created

| File | Purpose |
|------|---------|
| `src/features/shared/utils/formatPrice.ts` | `getCurrencySymbol(code)` and `formatPrice(amount, code)` |

### Files modified

| File | Change |
|------|--------|
| `src/features/settings/store/settingsStore.ts` | Added `currency` (default `'USD'`), `setCurrency`, `CurrencyCode` type, `currencyOptions` array |
| `src/pages/SettingsPage.tsx` | Added "Currency" section with `IonSelect` + `interface="action-sheet"` |
| `src/features/shopping/components/ShoppingItem.tsx` | Chip display: `formatPrice(price, currency)`; input prefix: `getCurrencySymbol(currency)` |
| `src/features/shopping/pages/ShoppingListDetail.tsx` | Total: `formatPrice(total, currency)`; input prefix: `getCurrencySymbol(currency)` |
| `src/features/shopping/pages/ShoppingOverview.tsx` | Card summary: `formatPrice(total, currency)` |

### Currency options

USD ($), EUR (€), GBP (£), CAD (CA$), AUD (A$), INR (₹), JPY (¥)

### Settings screen layout

```
Settings
  APPEARANCE
    ┌───────────────────────────┐
    │ System default         ●  │
    │ Light                  ○  │
    │ Dark                   ○  │
    └───────────────────────────┘

  CURRENCY
    ┌───────────────────────────┐
    │ Currency     USD ($)   >  │  ← tap → action sheet
    └───────────────────────────┘
```

---

## Step 4 — Shopping Overview Page (Priority: HIGH) ✅ DONE

**Goal**: Landing page showing all active shopping lists as cards, with create-new-list input.

### Files created

| File | Purpose |
|------|---------|
| `src/features/shopping/pages/ShoppingOverview.tsx` | List-of-lists page |
| `src/features/shopping/pages/ShoppingOverview.css` | Overview page styles |

### Wireframe (actual)

```
┌────────────────────────────────────────────┐
│  Shopping Lists                            │
│  3 active lists                            │
│                                            │
│  ┌────────────────────────────────────────┐│
│  │ 📝 [New list name...             ] [+] ││ ← composer-card, tertiary color
│  └────────────────────────────────────────┘│
│                                            │
│  🛒 ACTIVE                      (3)    ▼  │ ← group header, collapsible
│  ┊                                         │
│  │ 🛒 Weekly Groceries                     │ ← IonItem, border-left accent
│  │   12 items · $34.50            ✅ 8/12  │ ← price formatted with currency
│  ├─────────────────────────────────────────┤
│  │ 🛒 Hardware Store                       │
│  │   5 items · $89.20             ✅ 1/5   │
│  ├─────────────────────────────────────────┤
│  │ 🛒 Costco Run                           │
│  │   0 items · $0.00               0/0     │
│                                            │
│  📦 ARCHIVED                     (1)    ▶  │ ← collapsed by default
│                                            │
│  (empty state when no lists exist)         │
│    🛒                                       │
│    Your shopping lists live here.          │
│    Start one above.                        │
└────────────────────────────────────────────┘
```

### List card (IonItem)

Each card shows:
- Icon (`cartOutline`, `slot="start"`, 24px, tertiary color)
- Name (16px, bold, ellipsis overflow)
- Item count + total price (formatPrice with selected currency)
- Progress chip: `doneCount/totalCount` (IonChip, primary color badge)
- **Not** a progress bar — compact badge instead
- Tap → navigates to `/shopping/:id`
- `--border-radius: 0 12px 12px 0`, `border-left: 4px solid` accent bar, shadow-only
- `--padding-start: 14px`, `--padding-end: 14px`, `--padding-top: 12px`, `--padding-bottom: 12px`

### Active vs Archived

- **Active section**: unarchived lists, expanded by default
- **Archived section**: collapsed by default
- Both use **group headers** matching the TodoList pattern (icons, badges, collapsible chevron, color variants)
- Tertiary color for active, muted for archived
- Patch: `group--completed .task-row` border-left-color rule added for consistency

### Refinements vs original plan
- **Group headers** replicate `TodoList` pattern exactly (icons, badges, collapsible, color variants)
- **No progress bar** — replaced by compact `IonChip` badge (`doneCount/totalCount`)
- **List cards are `IonItem`** (not `IonCard`) with `slot="start"` icon
- **Create card** uses `composer-card` pattern with tertiary color overrides, matching `TodoInput`
- **Shadow-only containers** — no border+shadow ghost-card pattern
- **Left-border accent** on cards instead of top bar
- **Icon spacing** — removed `margin: 0` on icon to restore Ionic default ~16px gap
- **Empty state**: "Your shopping lists live here. Start one above." (not the original text)

### Acceptance criteria ✅

- Create a new list → appears as a card in Active section
- Tap a card → navigate to the list detail page
- Archive a list → card moves to Archived section
- Archived section collapsible
- Empty state when no lists exist

---

## Step 5 — Barcode Scanning (Priority: MEDIUM) ⏳ NOT STARTED

**Goal**: Camera-based barcode scanning with Open Food Facts lookup.

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
| `dotodo2.apparmor` | Add `"camera"` policy group (currently empty) |
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

## Step 6 — Real-Time Sharing (Priority: LOW — Deferred) ⏳ NOT STARTED

**Goal**: Real-time sync via Firebase.

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
| `/shopping` | `ShoppingOverview` | ✅ Done |
| `/shopping/:listId` | `ShoppingListDetail` | ✅ Done (repurposed from old `ShoppingPage`) |
| `/settings` | `SettingsPage` | ✅ Extended with currency picker |

No item-edit route — editing is inline via expand (Step 2).

---

## Appendix: File Tree After Phase 1

```
src/features/settings/store/
└── settingsStore.ts                    ← extended with currency state

src/features/shared/
├── types.ts                            ← ShoppingItem, isArchived on DoTodo
├── store/
│   └── doTodoStore.ts                  ← 6 new actions, 4 new selectors
└── utils/
    └── formatPrice.ts                  ← NEW: getCurrencySymbol, formatPrice

src/features/shopping/
├── components/
│   ├── ShoppingItem.tsx                ← rewritten with inline edit
│   └── ShoppingItem.css
├── pages/
│   ├── ShoppingListDetail.tsx          ← repurposed from old ShoppingPage
│   ├── ShoppingListDetail.css
│   ├── ShoppingOverview.tsx            ← new
│   └── ShoppingOverview.css
└── (barcode/ and sharing/ — not yet created)

src/pages/
└── SettingsPage.tsx                    ← extended with currency IonSelect
```

Old files deleted:
- `ShoppingInput.tsx` / `.css` → replaced by inline input in `ShoppingListDetail`
- `ShoppingList.tsx` / `.css` → replaced by inline item list in `ShoppingListDetail`
- `ShoppingEditPage.tsx` / `.css` → replaced by inline expand-to-edit
- `ShoppingPage.tsx` / `.css` → replaced by `ShoppingListDetail.tsx`
- `Shopping.styles.ts` → replaced by per-component CSS

---

## Appendix: Dependency Graph

```
Step 1 (data model + store)
  └─ Step 2 (ShoppingItem with inline edit)
       └─ Step 3 (ShoppingListDetail)
            ├─ Step 3a (currency setting) ← added during implementation
            └─ Step 4 (ShoppingOverview)
                 └─ Step 5 (barcode) ← not started
                      └─ Step 6 (Firebase sharing) ← not started
```

---

## Appendix: NPM Dependencies

Status | Package | Step
-------|---------|------
❌ Not added | `@zxing/library` | Step 5
❌ Not added | `firebase` | Step 6

---

## Appendix: Design System — Card & Container Conventions

All containers in the shopping feature follow these CSS conventions (unified with todo feature):

| Rule | Value |
|------|-------|
| **Card container** | `box-shadow: var(--dotodo-shadow-card)` only |
| **Border accent** | `border-left: 4px solid` accent color |
| **Border radius** | `border-radius: 0 12px 12px 0` (flat on left edge where accent sits) |
| **Completion border** | `group--completed .task-row` → `border-left-color: var(--dotodo-success)` |
| **Shadow only** | No `border` + `box-shadow` ghost-card pattern |
| **Overview list cards** | `IonItem` (not `IonCard`), icon via `slot="start"` |
| **Group headers** | Replicated from `TodoList.css` — icons, badges, collapsible, color variants |
| **Composer card** | Matches `TodoInput` pattern — grid layout, pill button, specific padding |
| **Create/Detail composer** | Horizontal padding: 14px |
| **Overview list cards** | Horizontal padding: 12px 14px |
| **Item rows** | Symmetric padding: 14px |
