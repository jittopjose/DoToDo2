# Recurring Checklists ("Routines") — Trial Implementation & Rollback Plan

## Overview

Build the recurring-checklist feature on top of scaffolding that already exists
but is inert: `ItemType` already has `'checklist'` (`shared/types.ts:3`), the
`/checklist/:name` route is wired (`App.tsx:136`), the "Check" chip navigates to
it (`TodoPage.tsx:127`), and `TodoInput` has a checklist placeholder. Only
`ChecklistPage.tsx` is a stub.

**Positioning**: recurring routine ticker — a flat list of checkable items that
repeats on a schedule. NOT a generic "checklist" that duplicates tasks+subtasks.

**Trial framing**: the feature is built **additively** — new selectors, one new
page, new CSS. No existing store method, no `TodoItem`, and no task behavior is
modified. Blast radius is limited to new files + 2 added selectors, so removal
is a per-commit revert with no data migration.

**Status (2026-08-02)**: Planning. Decisions locked (see Appendix): revert-only
removal, inline tap-to-expand, no data-migration concern (pre-release dev state —
the feature ships or is reverted before real users exist).

---

## Why this is low-risk (read this first)

1. **Zero schema change.** A checklist is a `DoTodo` with `subtasks[]` +
   `recurrence` — the exact persisted shape of a task-with-subtasks that the
   store already writes. Removal therefore needs **no migration**.
2. **Additive-only during the trial.** We never edit an existing symbol.
   `toggleEntry` (1 caller, `TodoItem.tsx:42`) and `addEntry` (1 caller,
   `TodoInput.tsx:38`) are reused as-is, not changed.
3. **Discrete commits per step.** Every step is a small, revertable commit
   (`git revert <sha>` restores the prior shipped state).
4. **No de-duplication during the trial.** Tasks keep their subtask editor.
   Stripping subtasks out of tasks is a *post-success* optimization, explicitly
   out of scope for the trial — it would widen the blast radius and complicate
   rollback.

---

## Step 1 — Store selectors (additive, commit)

**Goal**: Pure read selectors so the page can query checklist entries.

### Files to modify

| File | Change |
|------|--------|
| `src/features/shared/store/doTodoStore.ts` | Add `selectChecklists` + `selectChecklistProgress` |

Place next to `selectActiveShoppingLists` (~line 523). No existing code touched.

### New selectors

```
selectChecklists(state)                 → DoTodo[] where itemType === 'checklist'
selectChecklistProgress(listId)(state)  → { total, completed } over subtasks
```

### Acceptance criteria

- ✅ Both selectors added as pure functions (no store mutation)
- ✅ `npm run lint` + `npm run test.unit` pass
- ✅ Commit: `feat(checklist): add checklist selectors`

---

## Step 2 — Checklist page (overview + inline detail, commit)

**Goal**: A working page where you create, tick, edit, and delete checklist items.

### Files to create

| File | Purpose |
|------|---------|
| `src/features/checklist/pages/ChecklistPage.tsx` | Overview + inline expand |
| `src/features/checklist/pages/ChecklistPage.css` | Page styles |

### Components

- **Composer** auto-typed to `checklist` (placeholder "Enter checklist title") →
  `addEntry(title, 'checklist', …)` (reuse `TodoInput` pattern, fixed type).
- **Card list** from `selectChecklists`: title, progress chip `X/Y`, schedule
  badge (`↻ daily` only when recurrence set). Split into **Routines** (has
  recurrence) and **One-off** sections to signal the differentiator visually.
- **Tap-to-expand** inline: subtask cards reusing the existing `.subtask-card`
  styles from `TodoItem.css` — tick (`toggleSubtask`), tap label to edit inline
  (`updateSubtask`), delete (`deleteSubtask`), add-item row (`addSubtask`),
  delete checklist (`deleteEntry`).
- **Empty state** ("Blank page" pattern from `TodoList.tsx:169`).

### Acceptance criteria

- ✅ Create a checklist from the page → appears under One-off (or Routines if scheduled)
- ✅ Tick / edit / delete items; delete the whole checklist
- ✅ Expand state collapses; progress chip updates live
- ✅ `npm run lint` + `npm run test.unit` pass
- ✅ Commit: `feat(checklist): build checklist page`

---

## Step 3 — Routine flow (commit)

**Goal**: Make checklists *recurring* — the differentiator vs tasks+subtasks.

### Files to modify

| File | Change |
|------|--------|
| `src/features/checklist/pages/ChecklistPage.tsx` | "Complete today", RepeatSection, Active/Completed toggle |

### Behavior (all reuses existing store logic)

- **RepeatSection** on the card sets `recurrence` (existing component).
- **"Complete today"** → `toggleEntry(id)`. This already clones the shell,
  resets all subtasks, and sets the next due date (`doTodoStore.ts:118-144`).
- **Toast** on routine completion: "Packing list — next run tomorrow".
- **Active / Completed** toggle on the overview: Completed = one-off lists that
  were ticked to completion + past routine occurrences (`isCompleted` +
  `completedAt` already tracked by the store).

### Acceptance criteria

- ✅ Completing a recurring checklist resets items to `0/N` and shows the next occurrence
- ✅ One-off checklist completes and moves to Completed
- ✅ Repeat schedule configurable and persisted
- ✅ `npm run lint` + `npm run test.unit` pass
- ✅ Commit: `feat(checklist): recurring routine completion`

---

## Step 4 — Evaluation gate & decision

**Context**: pre-release dev state. There are no real users, so "evaluation"
means: use the feature yourself while developing, and decide keep-or-remove
**before** shipping. There is no external-usage timebox.

### Success signals ("it works" — for you)

- You reach for a recurring checklist for packing, routines, or chores and it
  feels faster than building a task with subtasks
- The "Complete today" reset flow (items clear, next run scheduled) feels right
- You'd miss it if it were gone

### Failure signals ("remove it")

- You keep building these as tasks+subtasks instead — the checklist adds nothing
- Recurrence goes unused; it degrades into a worse copy of tasks+subtasks
- It feels like two features doing the same job (confusion)

### Decision

- **Keep** → follow-up: de-dup tasks' subtask editor, add stats/streaks, templates.
- **Remove** → apply the rollback plan below (revert Steps 3→1 before release).

---

## Removal / rollback plan

**Context**: pre-release dev state. The feature either ships (post-success) or is
reverted before real users exist, so leftover dev data is not a concern — no
migration needed, and any dev checklist rows can simply be cleared from storage.

### Procedure

```
git revert <sha-step3> <sha-step2>     # page + routine flow
git revert <sha-step1>                 # optional — selectors are harmless pure reads
```

Reverting Steps 2–3 returns the app to today's exact state: inert placeholder
plus a "Check" chip that navigates to a stub. That is already the shipped
behavior, so no regression is introduced.

- **No migration.** In dev state, clearing IndexedDB (or ignoring) orphaned
  `itemType: 'checklist'` rows is sufficient; nothing in the app assumes
  `'checklist'` is absent (type filtering is driven by `itemType`).
- **No runtime kill switch.** Revert-by-commit is sufficient for a short trial.
  A Settings toggle would add code and widen blast radius for no benefit at this
  stage.

---

## Dependency graph

```
Step 1 (selectors) — pure addition, no dependency
   └─ Step 2 (page) — needs Step 1
        └─ Step 3 (routines) — needs Step 2
Step 4 — decision point, no code
```

## Implementation order

```
1 → 2 → 3   (each a discrete commit, verified after each step)
4           (evaluation, not a commit)
```

---

## Verification commands (after each step)

```sh
cd ionic-app
source "$HOME/.nvm/nvm.sh"
npm run lint
npm run test.unit
npm run build
```

---

## Non-goals (trial)

- No de-duplication of the task editor's subtask section (post-success only)
- No routines statistics / streaks / heatmap (post-success only)
- No checklist templates (post-success only)
- No separate detail route (`/checklist/:id`) unless inline expansion proves awkward

---

## Appendix: Locked decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Kill switch vs revert-only | **Revert-only** | A Settings toggle adds code + blast radius; commit-revert is sufficient for a short dev-stage trial |
| 2 | Inline expand vs separate route | **Inline tap-to-expand** | Lighter, no extra routing; a `/checklist/:id` route can be added later if expansion proves awkward |
| 3 | Leftover data on removal | **Not a concern** | Pre-release dev state — no real users, so no migration needed; dev rows can be cleared from storage |
