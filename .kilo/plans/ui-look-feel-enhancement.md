# dotodo2 Look-and-Feel Enhancement Plan

## Current State

- The app is an Ionic React web app embedded in a Qt/QML shell.
- Entry point: `qml/Main.qml` loads `qrc:/web/index.html`.
- Source UI lives in `ionic-app/src`; Vite builds it into `../web` via `ionic-app/vite.config.ts`.
- `ionic-app/src/theme/variables.css` is currently empty, so the app is mostly using Ionic defaults.
- Current UI structure:
  - `Page.tsx`: header, progress bar, search bar, `TodoInput`, `TodoList`.
  - `TodoInput.tsx`: type selector, date/priority buttons, detail fields, checklist subtasks.
  - `TodoItem.tsx`: task cards with checkbox, priority, overdue state, subtasks, shopping fields, due date.
  - `Menu.tsx`: side list navigation with custom list creation and completed-task cleanup.
- The current implementation is functional but visually generic because it relies on default Ionic components, empty theme variables, and many inline styles.

## Design Direction

Create a calm, personal daily planning app rather than a generic Ionic template.

Recommended visual identity:

- Mood: soft, focused, daily-use productivity app.
- Palette: warm off-white surfaces, deep ink text, muted indigo primary, soft green success, amber warning, coral danger.
- Shape language: rounded cards, pill controls, soft dividers, subtle shadows.
- Layout: spacious sections, less toolbar density, visible progress, clear empty states.
- Motion: subtle fade/slide transitions only for task add/complete/delete; avoid heavy animations.
- Dark mode: keep the same identity with lower-contrast surfaces and softer shadows.

Avoid:

- External fonts or remote assets, because the app is packaged locally through Qt resources.
- Heavy animations that could feel slow on older mobile hardware.
- Large functional scope creep; keep existing todo behavior intact.

## Implementation Plan

### 1. Establish a Custom Theme

Files:

- `ionic-app/src/theme/variables.css`
- `ionic-app/src/App.tsx`

Tasks:

- Replace the empty theme file with a full Ionic CSS variable theme.
- Define app-level design tokens:
  - `--dotodo-bg`, `--dotodo-surface`, `--dotodo-surface-strong`
  - `--dotodo-text`, `--dotodo-muted`
  - `--dotodo-primary`, `--dotodo-primary-rgb`, `--dotodo-primary-contrast`
  - `--dotodo-success`, `--dotodo-warning`, `--dotodo-danger`
  - `--dotodo-radius-sm`, `--dotodo-radius-md`, `--dotodo-radius-lg`
  - `--dotodo-shadow-soft`, `--dotodo-shadow-card`
  - `--dotodo-motion-fast`
- Override Ionic variables:
  - `--ion-color-primary`
  - `--ion-color-primary-rgb`
  - `--ion-color-primary-contrast`
  - `--ion-background-color`
  - `--ion-background-color-rgb`
  - `--ion-text-color`
  - `--ion-item-background`
  - `--ion-toolbar-background`
  - `--ion-color-danger`, `--ion-color-success`, `--ion-color-warning`
- Add `@media (prefers-color-scheme: dark)` overrides.
- Import `@ionic/react/css/palettes/dark.system.css` as currently done; the dark-mode variables should refine it instead of replacing it.

Acceptance criteria:

- The app no longer feels like default Ionic blue.
- Light and dark modes both work.
- All existing Ionic components remain usable.

### 2. Polish the Main Page Header

Files:

- `ionic-app/src/pages/Page.tsx`
- `ionic-app/src/pages/Page.css`

Tasks:

- Turn the header into a branded focus area:
  - List name as a large title.
  - Small subtitle such as active/completed count.
  - Progress summary in a rounded card instead of a bare toolbar row.
  - Compact search bar inside a surface with softer corners.
  - “Clear Completed” as a ghost/secondary action.
- Keep `IonProgressBar`, but style it as a custom progress track using CSS variables.
- Add a small empty-state-safe top padding so content does not feel cramped.
- Consider surfacing the existing `filter` state with a compact segmented control if desired, but do not change filtering behavior unless intentionally added.

Acceptance criteria:

- The list page immediately communicates “this is my daily planning space.”
- Progress is visible but not distracting.
- Search feels integrated rather than pasted into the toolbar.

### 3. Redesign the Todo Composer

Files:

- `ionic-app/src/features/todos/components/TodoInput.tsx`
- New or updated CSS file, preferably `TodoInput.css`

Tasks:

- Wrap the composer in a card-like surface.
- Convert the type selector from default Ionic segment buttons into pill-style tabs:
  - Task
  - Shopping
  - Note
  - Checklist
- Make date and priority controls look intentional:
  - Show a small label when selected.
  - Use soft filled backgrounds for active states.
  - Keep touch targets large.
- Keep the add button prominent.
- Convert checklist subtask previews into small chips or compact rows.
- Reduce inline styles by moving most styling into CSS classes.

Acceptance criteria:

- Adding a task feels like the primary action of the app.
- The composer is visually distinct from the task list.
- Existing add behavior remains unchanged.

### 4. Turn Todo Items into Designed Cards

Files:

- `ionic-app/src/features/todos/components/TodoItem.tsx`
- New or updated CSS file, preferably `TodoItem.css`
- `ionic-app/src/features/todos/components/TodoList.tsx`

Tasks:

- Add a wrapper class to each `IonItemSliding`.
- Style items as soft cards:
  - Rounded corners.
  - Subtle border.
  - Slight background contrast.
  - Optional soft shadow in light mode.
- Improve visual hierarchy:
  - Title as the strongest text.
  - Description muted and smaller.
  - Type icon in a small colored chip.
  - Priority dot remains but with softer colors.
  - Overdue tasks get a coral accent and “Overdue” badge.
  - Completed tasks get muted text and a gentle strikethrough.
- Improve subtask rows:
  - Use compact rows with check icon and muted text.
  - Keep clickable/tappable completion behavior.
- Move repeated inline styles into reusable CSS classes.
- Ensure `IonItemOptions` delete action still works.

Acceptance criteria:

- A task list looks like a polished product, not a stack of Ionic rows.
- Priority, overdue, type, due date, and subtask state are visually clear.
- No existing editing, completion, deletion, or subtask behavior is broken.

### 5. Improve Empty States

Files:

- `ionic-app/src/features/todos/components/TodoList.tsx`
- `ionic-app/src/pages/Page.css` or new `TodoList.css`

Tasks:

- Replace the plain centered empty state with a friendly card:
  - Large soft icon circle.
  - Warm headline.
  - Short helpful copy.
  - Optional quick hint.
- Differentiate:
  - “Nothing here yet” for an empty list.
  - “No matches found” for search/filter results.
- Keep the existing icon-based approach, but style it more intentionally.

Acceptance criteria:

- Empty states feel inviting instead of blank.
- Users understand the next action.

### 6. Redesign the Side Menu

Files:

- `ionic-app/src/components/Menu.tsx`
- `ionic-app/src/components/Menu.css`

Tasks:

- Add a branded menu header:
  - App name/mark.
  - Active task count.
  - Small subtitle.
- Style list rows as rounded pills with generous spacing.
- Improve selected state:
  - Soft primary background.
  - Primary icon color.
  - Optional left accent line.
- Style custom list input as a compact “create list” card.
- Style “Clear Completed” with a subtle danger/secondary tone.
- Keep `IonMenu` and `IonMenuToggle` behavior unchanged.

Acceptance criteria:

- The menu feels like part of the same product identity.
- Active list is obvious.
- Counts remain visible and useful.

### 7. Add Subtle Microinteractions

Files:

- `ionic-app/src/pages/Page.css`
- `ionic-app/src/features/todos/components/TodoItem.css`
- `ionic-app/src/features/todos/components/TodoInput.css`

Tasks:

- Keep the existing fade-in for new tasks.
- Add a softer completed-state transition.
- Add hover/active states for large buttons and pills where supported.
- Use `@media (prefers-reduced-motion: reduce)` to disable animations.
- Optional: use `@capacitor/haptics` on complete/delete/add if the app already supports native haptics in the target environment.

Acceptance criteria:

- The app feels responsive and polished.
- Motion does not slow down task interactions.
- Reduced-motion preference is respected.

### 8. Update App Identity Assets

Files:

- `ionic-app/public/manifest.json`
- `assets/logo.svg` or new icon assets if created
- `web/manifest.json` is build output; update source manifest instead.

Tasks:

- Change manifest `short_name` and `name` from “Ionic App” / “My Ionic App” to `dotodo2`.
- Set manifest `theme_color` and `background_color` to the new brand colors.
- Ensure icon assets exist and are packaged.
- Optionally use the app logo in the menu/header as an SVG or inline mark.

Acceptance criteria:

- The app identity is consistent across launcher, PWA manifest, and in-app branding.
- No placeholder “Ionic App” text remains in source manifests.

## Suggested File Structure

Keep the source organized as:

```text
ionic-app/src/
  App.tsx
  theme/
    variables.css
  components/
    Menu.tsx
    Menu.css
  pages/
    Page.tsx
    Page.css
  features/todos/
    components/
      TodoInput.tsx
      TodoInput.css
      TodoItem.tsx
      TodoItem.css
      TodoList.tsx
      TodoList.css
```

If creating new CSS files, import them from the corresponding component file.

## Validation Plan

Run these checks after implementation:

1. `cd ionic-app && npm run build`
2. Confirm `../web/index.html`, `../web/app.js`, `../web/app.css`, and `../web/manifest.json` are regenerated.
3. Open the built app and verify:
   - Light mode theme.
   - Dark mode theme.
   - List header and progress card.
   - Composer card and pill tabs.
   - Task card styling.
   - Empty states.
   - Side menu.
   - Search, add, edit, complete, delete, subtasks, due dates, and shopping fields still work.
4. If building for the Qt shell:
   - Rebuild the desktop package.
   - Confirm `Main.qml` still loads `qrc:/web/index.html`.
   - Check that the app opens without remote assets or missing icons.

## Risks and Mitigations

- **Ionic component internals are hard to style.**
  - Prefer CSS variables and class-based wrappers over fragile selectors.
- **Qt WebEngine may not support every modern CSS feature.**
  - Use `backdrop-filter` and gradients only with fallbacks.
- **Too many inline styles make future design changes harder.**
  - Move repeated styling into CSS files.
- **Heavy animations can hurt performance.**
  - Keep motion short, subtle, and disabled for reduced-motion users.
- **Changing layout can accidentally alter behavior.**
  - Keep all existing event handlers and state updates intact; treat this as a visual redesign.

## Final Acceptance Criteria

The redesign is successful when:

- The app no longer looks like a generic Ionic template.
- The interface feels calm, warm, and usable every day.
- The todo list, composer, header, menu, and empty states have a consistent visual identity.
- Existing functionality is preserved.
- Light mode, dark mode, and packaged Qt loading all work.
