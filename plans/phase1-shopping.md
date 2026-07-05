# Phase 1 — Shopping List Feature

## Overview
Build a dedicated shopping list into the DoToDo2 app. Each step is independently
verifiable — you can see the result in the app immediately after implementation.
Steps are ordered by dependency (each step builds on the previous one).

**Global decisions**:
- `DoTodo.category?: string` added to types in Step 3
- Completed items stay in the running total with strikethrough styling (not excluded)
- All shopping components live under `src/features/shopping/`
- Shared Zustand store at `src/features/shared/store/` powers all data

---

## Step 1 — Shopping Scaffold (Priority: HIGH)
**Goal**: Replace placeholder with a fully working shopping list page.

### Files to create
| File | Purpose |
|------|---------|
| `src/features/shopping/pages/ShoppingPage.tsx` | Full page with greeting, search, type filter locked to `'shopping'`, ShoppingInput + ShoppingList |
| `src/features/shopping/pages/ShoppingPage.css` | Page-level styles |
| `src/features/shopping/components/ShoppingInput.tsx` | Text field + quantity stepper (default 1) + add button + barcode icon (disabled) |
| `src/features/shopping/components/ShoppingInput.css` | Input styles (match composer-card pattern from TodoInput.css) |
| `src/features/shopping/components/ShoppingItem.tsx` | IonCheckbox + name + quantity badge (×N) + price chip (hidden if unset) |
| `src/features/shopping/components/ShoppingItem.css` | Item styles |
| `src/features/shopping/components/ShoppingList.tsx` | Flat list of ShoppingItem (no grouping yet) |
| `src/features/shopping/components/ShoppingList.css` | List styles |

### Wireframe (text)
```
┌──────────────────────────────┐
│  Good morning                │
│  Shopping list for today     │
├──────────────────────────────┤
│  [input: What to buy?] [qty] │
│  [qty stepper: 2] [+ add] 📷│
├──────────────────────────────┤
│  ☐ Milk                  ×2  │
│  ☐ Bread                 ×1  │
│  ☑ Butter (strikethrough) ×1 │
└──────────────────────────────┘
```

### Acceptance criteria
- Navigate to `/shopping/all-lists` → see the page
- Add items with quantity → they appear in the list
- Check items off → strikethrough style
- Search filters items by name
- Type filter locked to `'shopping'` (no switching to todo/note/checklist)
- Empty state shown when no shopping items exist

### Dependencies
- Shared store already supports `itemType: 'shopping'`
- Route `/shopping/:name` already exists in App.tsx

---

## Step 2 — Price + Running Total (Priority: MEDIUM)
**Goal**: Add price tracking and cart total.

### Files to modify
| File | Change |
|------|--------|
| `ShoppingInput.tsx` | Add price field (numeric, `$` prefix) |
| `ShoppingItem.tsx` | Show price chip (`$3.50`) beside quantity badge |
| `ShoppingPage.tsx` | Add total bar below search: `Total: $12.50` |

### Wireframe (text)
```
┌──────────────────────────────┐
│  🛒 Total: $12.50            │
├──────────────────────────────┤
│  [input: What to buy?] [qty] │
│  [$][price]         [+ add]  │
├──────────────────────────────┤
│  ☐ Milk      ×2   $3.50     │
│  ☐ Bread     ×1   $2.00     │
│  ☑ Butter    ×1   $5.00 ~~~ │ (strikethrough)
└──────────────────────────────┘
```

### Acceptance criteria
- Price field in input → item saves with price
- Price shown on each item chip
- Total bar updates in real-time as items are added/modified
- Completed items still counted in total (with strikethrough)
- Items without price show no price chip (not $0)

---

## Step 3 — Categories (Priority: MEDIUM)
**Goal**: Auto-categorize shopping items and group them in the list.

### Files to create
| File | Purpose |
|------|---------|
| `src/features/shopping/utils/shoppingCategories.ts` | Keyword→category mapping + auto-tag function |

### Files to modify
| File | Change |
|------|--------|
| `src/features/shared/types.ts` | Add `category?: string` to `DoTodo` |
| `ShoppingInput.tsx` | On add: call auto-tag → save `category` on entry |
| `ShoppingItem.tsx` | Add colored `IonChip` showing category name |
| `ShoppingList.tsx` | Group items by category (collapsible headers) |
| `ShoppingList.css` | Category group header styles |

### Category mapping (proposed)
```
produce:  apple, banana, lettuce, tomato, onion, garlic, potato, carrot, spinach, broccoli, mushroom, avocado, lemon, lime, orange, grapes, strawberry, blueberry, melon, cucumber, pepper, zucchini, celery, kale, cilantro, parsley, corn
dairy:    milk, cheese, yogurt, butter, cream, sour cream, cottage cheese, cream cheese, eggs, margarine
meat:     chicken, beef, pork, turkey, bacon, sausage, ham, lamb, steak, ground beef, ribs, chicken breast, chicken thigh, deli, salami, pepperoni
bakery:   bread, bagel, croissant, muffin, baguette, tortilla, pita, roll, bun, cake, cookie, pastry, donut, pie, brownie
pantry:   rice, pasta, flour, sugar, salt, pepper, oil, vinegar, sauce, spice, cereal, oatmeal, peanut butter, jam, honey, syrup, beans, lentils, canned, soup, broth, stock, olive oil, coconut milk, soy sauce, ketchup, mustard, mayonnaise, baking powder, baking soda, yeast, noodles, couscous, quinoa, popcorn, chips, crackers
frozen:   ice cream, frozen pizza, frozen vegetables, frozen fruit, frozen meals, frozen, popsicle
beverages: juice, soda, water, coffee, tea, beer, wine, liquor, sparkling water, coconut water, sports drink, energy drink, kombucha
household: soap, detergent, paper towels, toilet paper, toothpaste, shampoo, cleaning, trash bags, dish soap, laundry, sponge, tissue, bleach, disinfectant
other:    (fallback for anything not matched)
```

### Wireframe (text)
```
┌──────────────────────────────┐
│  🛒 Total: $12.50            │
├──────────────────────────────┤
│  [input: What to buy?]  [qty]│
│  [$][price]          [+ add] │
├──────────────────────────────┤
│ ▼ Dairy (2)                  │
│  ☐ Milk      ×2    $3.50 🏷️Dairy│
│  ☐ Yogurt    ×1    $2.00 🏷️Dairy│
├──────────────────────────────┤
│ ▼ Bakery (1)                 │
│  ☐ Bread     ×1    $2.00 🏷️Bakery│
├──────────────────────────────┤
│ ▼ Produce (0) (collapsed)    │
└──────────────────────────────┘
```

### Acceptance criteria
- New items auto-tagged with category based on title keywords
- List grouped by category headers (collapsible)
- Each item shows category badge
- User can't manually set category yet (comes in Step 5)
- Items with no match → "Other" category

---

## Step 4 — Barcode Scanning (Priority: MEDIUM)
**Goal**: Camera-based barcode scanning with Open Food Facts lookup.

### Files to create
| File | Purpose |
|------|---------|
| `src/features/shopping/components/ScannerOverlay.tsx` | Full-screen camera preview in IonModal |
| `src/features/shopping/components/ScannerOverlay.css` | Overlay styles (viewport overlay, scan frame guide) |
| `src/features/shopping/services/barcode.service.ts` | @zxing/library BrowserMultiFormatReader wrapper + Open Food Facts API fetch |

### Files to modify
| File | Change |
|------|--------|
| `ShoppingInput.tsx` | Wire scan button → opens ScannerOverlay |
| `dotodo2.apparmor` | Add `"camera"` policy group for Ubuntu Touch |
| `package.json` | Add `@zxing/library` dependency |

### Architecture
```
User taps 📷
  → ScannerOverlay opens (IonModal)
  → navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  → @zxing BrowserMultiFormatReader decodes in real-time
  → On decode success:
      → GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json
      → Extract product_name, categories_tags
      → Close overlay, pre-fill input fields (name + category)
  → Manual fallback: "Enter barcode manually" text field always visible
  → If getUserMedia fails (Qt WebEngine without camera):
      → Show manual entry + note "Camera not available"
      → Future: fall back to C++ ZBar plugin via bridge.service.ts
```

### Acceptance criteria
- Scan button in input → opens camera overlay
- Scanning a real barcode → auto-fills name and category from Open Food Facts
- Manual barcode entry available as fallback
- Dismiss overlay without scanning returns to input
- No crash if camera permission denied — graceful error message

---

## Step 5 — Shopping Edit Page (Priority: LOW)
**Goal**: Tap an item to edit all shopping-specific fields.

### Files to create
| File | Purpose |
|------|---------|
| `src/features/shopping/pages/ShoppingEditPage.tsx` | Edit page with all shopping fields |
| `src/features/shopping/pages/ShoppingEditPage.css` | Edit page styles |

### Files to modify
| File | Change |
|------|--------|
| `ShoppingItem.tsx` | Tap handler → navigate to `/shopping/:id/edit` |
| `App.tsx` | Add route: `<Route path="/shopping/:id/edit"><ShoppingEditPage /></Route>` |
| `ShoppingItem.css` | Add hover/tap indicator styles |

### Edit page fields
- **Name** (text input)
- **Quantity** (stepper + numeric input, 1-999)
- **Unit** (dropdown: pcs, kg, g, l, ml, oz, lb, pack, bunch)
- **Price** (numeric input, currency)
- **Category** (dropdown, pre-filled from auto-tag, user can override)
- **Save** button in header
- **Delete** button with confirmation alert

### Wireframe (text)
```
┌──────────────────────────────┐
│ ← Back        Edit    Save 🗑│
│              Item            │
├──────────────────────────────┤
│  Name                        │
│  ┌──────────────────────┐   │
│  │ Milk                  │   │
│  └──────────────────────┘   │
│                              │
│  Quantity         Unit       │
│  ┌──┐ ┌──┐ ┌──┐  ┌──────┐  │
│  │－│ │3 │ │＋│  │pcs  ▼│  │
│  └──┘ └──┘ └──┘  └──────┘  │
│                              │
│  Price                       │
│  ┌──────────────────────┐   │
│  │ $       3.50          │   │
│  └──────────────────────┘   │
│                              │
│  Category                    │
│  ┌──────────────────────┐   │
│  │ Dairy              ▼│   │
│  └──────────────────────┘   │
└──────────────────────────────┘
```

### Acceptance criteria
- Tap any shopping item → opens edit page
- All fields pre-populated with current values
- Edit fields → Save → changes reflected in list
- Delete with confirmation → item removed
- Cancel/back → no changes saved

---

## Step 6 — Real-Time Sharing (Priority: LOW — Deferred)
**Goal**: Real-time sync shopping lists across devices via Firebase.

### Files to create
| File | Purpose |
|------|---------|
| `src/services/firebase.service.ts` | Firebase init, anonymous auth, Firestore refs |
| `src/services/share.service.ts` | Invite code gen, Firestore merge into Zustand |

### Files to modify
| File | Change |
|------|--------|
| `ShoppingPage.tsx` | Add Share button in header → show invite code/QR |
| `ShoppingList.tsx` | Show "shared with N others" indicator |
| `dotodo2.apparmor` | Add `"network"` and `"networking"` policy groups |
| `package.json` | Add `firebase` dependency |

### Architecture
```
User taps Share
  → Firebase anonymous auth (silent)
  → Generate random 6-char invite code
  → Show code + QR in modal
  → Remote user enters code
  → Subscribe to Firestore collection for that list
  → onSnapshot → merge writes into Zustand store
  → Zustand writes → Firestore writes (bidirectional)
```

### Acceptance criteria
- Share button on shopping page → shows invite code
- Second device enters code → both see same items in real-time
- Changes on either device sync to the other within seconds
- Offline: local changes queued, sync when online
- Works without sign-up/email/password

---

## Appendix: Module Dependency Graph

```
Step 1 (scaffold) ─────────────────────────────────┐
  └─ Step 2 (prices + total) ← depends on Step 1   │
       └─ Step 3 (categories) ← depends on Step 2  │
            └─ Step 4 (barcode) ← depends on Step 3 │
                 └─ Step 5 (edit page) ← depends on │
                      └─ Step 6 (sharing) ← depends │
                          on Steps 1-5              │
                                                  ▼
                                         Working shopping
                                         list feature
```

## Appendix: File Tree After Phase 1
```
src/features/shopping/
├── components/
│   ├── ScannerOverlay.tsx
│   ├── ScannerOverlay.css
│   ├── ShoppingInput.tsx
│   ├── ShoppingInput.css
│   ├── ShoppingItem.tsx
│   ├── ShoppingItem.css
│   ├── ShoppingList.tsx
│   └── ShoppingList.css
├── pages/
│   ├── ShoppingEditPage.tsx
│   ├── ShoppingEditPage.css
│   ├── ShoppingPage.tsx
│   └── ShoppingPage.css
├── services/
│   └── barcode.service.ts
└── utils/
    └── shoppingCategories.ts
```

## Appendix: New/Modified NPM Dependencies
- `@zxing/library` (Step 4)
- `firebase` (Step 6)
