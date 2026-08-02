# Phase 3 — Shopping List Feature Enhancements

## Overview

Phase 2 built the core shopping experience: store mode, categories, sorting,
templates, archive with summary, and recent products. Phase 3 continues with
real-time sharing and smart suggestions.

**Status (2026-07-20)**: Planning in progress. Phase 2 Step 6 (Firebase Sharing)
carried over as last item.

---

## Step 1 — Smart Suggestions (Priority: MEDIUM)

**Goal**: Make it faster to add items you buy regularly.

> Refines the "Recent Products" feature from Phase 2 Step 5. Two improvements:
> (1) One-tap add via "+" button on chips, (2) Smarter ranking by frequency × recency.

### Files to modify

| File | Change |
|------|--------|
| `ShoppingListDetail.tsx` | Add "+" button to recent product chips; handle direct add on tap; update ranking formula |
| `ShoppingListDetail.css` | Style "+" button on chips (tertiary color, small icon) |
| `src/features/shopping/store/recentProductsStore.ts` | Add `getSuggestions()` method with frequency × recency ranking |

### Improvement 1: One-tap add

Currently: Tap chip fills input → user presses Enter to confirm (4 steps).

New: Tap "+" on chip adds item directly (1 step). Tapping the item name still fills input (for editing).

```
Current:
┌─────────────────────────────────────┐
│  Add an item...                     │
├─────────────────────────────────────┤
│  [Milk] [Eggs] [Bread] [Cheese]    │  ← tap fills input
└─────────────────────────────────────┘

New:
┌─────────────────────────────────────┐
│  Add an item...                     │
├─────────────────────────────────────┤
│  [Milk +] [Eggs +] [Bread +]       │  ← tap "+" adds directly
└─────────────────────────────────────┘
```

#### Design decisions (finalized)

- **Chip layout**: Two tap zones on one chip. Chip body fills input (old behavior);
  a small "+" icon pinned at the right edge adds directly. "+" uses `stopPropagation`
  so the two zones don't conflict. (Option A)
- **Direct add**: Calls `addShoppingItem(listId, title, undefined, undefined, category)`
  then `recordUsage(title, category)` (increments count — item used again).
- **Chip stays** after direct add — user may add multiple quantities of the same item.
- **No toast** on direct add — item appearing in the list below is feedback enough.
- **Independent of input**: Tapping "+" adds even if text is currently in the input
  field (input state is untouched).

### Improvement 2: Smarter ranking

Currently: Sorted by `lastUsed` (most recent first).

New: Factor in frequency. Items bought regularly rank higher.

Formula: `score = useCount × recencyWeight`

Where `recencyWeight`:
- Bought today: 1.0
- Bought this week: 0.8
- Bought this month: 0.5
- Bought older: 0.2

Example:
- Milk: useCount=12, bought yesterday → score = 12 × 1.0 = 12.0
- Eggs: useCount=8, bought 3 days ago → score = 8 × 0.8 = 6.4
- Saffron: useCount=1, bought today → score = 1 × 1.0 = 1.0

Result: Milk and Eggs (staples) rank above Saffron (rare).

#### Design decisions (finalized)

- **Store method**: Add `getSuggestions()` to `recentProductsStore` (returns products
  sorted by score). A pure helper `scoreProduct(p, now)` exported from the store file.
- **`recordUsage` sort stays** as `lastUsed` (keeps persisted data tidy); display order
  is computed at render via `getSuggestions()`.
- **Recency weights**: Use the 1.0 / 0.8 / 0.5 / 0.2 bucket approach (no smooth decay).

### Acceptance criteria

- ✅ "+" button visible on recent product chips (right-edge zone, `stopPropagation`)
- ✅ Tapping "+" adds item directly to list (independent of input state)
- ✅ Chip stays in row after direct add; no toast
- ✅ Tapping item name still fills input (existing behavior preserved)
- ✅ Chips filter by typed text (existing behavior preserved)
- ✅ Items ranked by `getSuggestions()` (frequency × recency), not just recency
- ✅ No layout changes — reuses existing chip row

---

## Step 2 — Real-Time Sharing via Firebase (Priority: LOW)

> Carried over from Phase 2 Step 6.

**Goal**: Real-time sync so two people can edit a shopping list simultaneously.

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
Step 1 (Smart Suggestions) — enhances recent products from Phase 2 Step 5
   └─ independent of Step 2

Step 2 (Firebase Sharing) — new data layer, independent
   └─ touches ShoppingListDetail + ShoppingOverview
   └─ no data model conflicts with Step 1
```

## Implementation order

```
1 → 2
```

Step 1 first (quick polish), then Step 2 (Firebase integration).

---

## Appendix: NPM Dependencies

Status | Package | Step
-------|---------|------
❌ Not added | `firebase` | Step 2

---

## Appendix: Design System Refs

All Phase 3 features follow the existing design system from `DESIGN.md` and
Phase 1/2 conventions. Key reminders:

- Cards use `box-shadow` only, `border-left` accent, `--border-radius: 0 12px 12px 0`
- Prefer Ionic components over custom CSS
- All prices formatted via `formatPrice()` with settings currency
- Shopping uses tertiary teal-green (`--ion-color-tertiary`) as accent
