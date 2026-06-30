---
version: alpha
name: dotodo2
description: >-
  A warm, card-based todo application for Ubuntu Touch with a dual-stack
  architecture — Qt5 QML shell embedding an Ionic React SPA via WebEngineView.
colors:
  primary: '#6c5ce7'
  primary-contrast: '#ffffff'
  primary-soft: 'rgba(108, 92, 231, 0.12)'
  secondary: '#8b5cf6'
  success: '#10b981'
  warning: '#f59e0b'
  danger: '#ef4444'
  bg: '#f7f4ef'
  surface: '#fffaf3'
  surface-strong: '#ffffff'
  text: '#202433'
  muted: '#687083'
  card: 'rgba(255, 250, 243, 0.92)'
  border: 'rgba(32, 36, 51, 0.1)'
  card-border: 'rgba(32, 36, 51, 0.08)'
  tertiary: '#14b8a6'
typography:
  heading-xxl:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 26px
    fontWeight: 850
    lineHeight: 1.08
    letterSpacing: -0.03em
  heading-xl:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 22px
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: -0.035em
  heading-lg:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 20px
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: -0.03em
  heading-md:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 18px
    fontWeight: 850
    lineHeight: 1.25
    letterSpacing: -0.02em
  heading-sm:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 17px
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: -0.02em
  title:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.02em
  body:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.4
  label:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 12px
    fontWeight: 750
    lineHeight: 1.3
    letterSpacing: 0.06em
  label-sm:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 12px
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: 0.05em
  chip:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 10px
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: 0.01em
  badge:
    fontFamily: 'Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 11px
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: 0.01em
rounded:
  sm: 10px
  md: 14px
  lg: 15px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 14px
  xl: 18px
  xxl: 24px
  section: 20px
  card-padding: 18px
  content-max-width: 720px
components:
  button-primary:
    rounded: '{rounded.full}'
    fontWeight: 700
    padding: null
  button-icon:
    width: 38px
    height: 38px
    rounded: '{rounded.sm}'
    padding: null
  button-composer-add:
    width: 46px
    height: 46px
    rounded: '{rounded.full}'
    backgroundColor: '{colors.primary}'
    boxShadow: '0 12px 24px rgba(108, 92, 231, 0.24)'
  card-default:
    rounded: '{rounded.xl}'
    backgroundColor: '{colors.surface-strong}'
    border: '1px solid {colors.card-border}'
    boxShadow: '0 8px 24px rgba(31, 41, 55, 0.08)'
  card-composer:
    rounded: 15px
    backgroundColor: '{colors.card}'
    backdropFilter: 'blur(18px)'
    boxShadow: '0 8px 24px rgba(31, 41, 55, 0.08)'
  chip-default:
    rounded: '{rounded.full}'
    fontSize: '{typography.chip.fontSize}'
    fontWeight: '{typography.chip.fontWeight}'
    minHeight: 24px
    transition: 'transform 180ms, box-shadow 180ms'
  chip-priority-low:
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
    color: '{colors.success}'
  chip-priority-medium:
    backgroundColor: 'rgba(245, 158, 11, 0.12)'
    color: '{colors.warning}'
  chip-priority-high:
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
    color: '{colors.danger}'
  chip-due:
    backgroundColor: 'rgba(108, 92, 231, 0.08)'
    color: '{colors.primary}'
  chip-due-overdue:
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
    color: '{colors.danger}'
  chip-subtask:
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
    color: '{colors.success}'
  input-default:
    rounded: '{rounded.md}'
    backgroundColor: '{colors.card}'
    border: '1px solid {colors.card-border}'
    caretColor: '{colors.primary}'
  input-title:
    fontSize: '{typography.heading-md.fontSize}'
    fontWeight: '{typography.heading-md.fontWeight}'
    borderBottom: '1px solid {colors.card-border}'
    caretColor: '{colors.primary}'
  searchbar:
    rounded: 18px
    backgroundColor: '{colors.surface-strong}'
    iconColor: '{colors.muted}'
    placeholderColor: '{colors.muted}'
  progress-bar:
    height: null
    backgroundColor: 'rgba(108, 92, 231, 0.14)'
    progressBackgroundColor: '{colors.primary}'
  checkbox:
    checkedBackground: '{colors.primary}'
    checkmarkColor: '{colors.primary-contrast}'
  type-icon-todo:
    backgroundColor: 'rgba(108, 92, 231, 0.12)'
    color: '{colors.primary}'
  type-icon-shopping:
    backgroundColor: 'rgba(20, 184, 166, 0.12)'
    color: '{colors.tertiary}'
  type-icon-note:
    backgroundColor: 'rgba(245, 158, 11, 0.13)'
    color: '{colors.warning}'
  type-icon-checklist:
    backgroundColor: 'rgba(16, 185, 129, 0.12)'
    color: '{colors.success}'
  modal-bottom-sheet:
    backgroundColor: '{colors.card}'
    rounded: '{rounded.lg} {rounded.lg} 0 0'
    boxShadow: '0 -18px 44px rgba(31, 41, 55, 0.16)'
---

## Overview

dotodo2 is a warm, approachable todo application designed for the Ubuntu Touch mobile platform. The brand personality sits at the intersection of **productive calm** and **playful warmth** — it should feel like a well-organized paper notebook rather than a cold corporate tool.

The visual identity pairs a **soft purple** (`--dotodo-primary`) with a **cream-warm** background (`--dotodo-bg: #f7f4ef`) to create a gentle, inviting atmosphere. Cards float with soft shadows and subtle borders, conveying depth without heaviness. The overall mood is cozy, reliable, and subtly delightful — with micro-animations (entry fades, completion glow, press scales) that reward interaction without being distracting.

Target users are Ubuntu Touch phone users who want a native-feeling todo app that is both powerful and aesthetically refined. The design should never feel overwhelming or busy.

## Colors

The palette is centered on a **soft purple** accent against a **warm cream** canvas, with semantic colors for feedback states. The system supports both light and dark modes via `prefers-color-scheme` media query — there is no in-app toggle.

### Light Mode

- **Primary (#6c5ce7):** A soft, muted violet used for all interactive elements — buttons, active filters, links, checkmarks, progress bars. It reads as confident but not aggressive.
- **Secondary (#8b5cf6):** A slightly lighter purple for secondary interactive states and active type filter backgrounds.
- **Success (#10b981):** Emerald green for completion states, subtask counts, low-priority indicators, and completed todo highlights.
- **Warning (#f59e0b):** Amber for medium-priority chips and note-type iconography.
- **Danger (#ef4444):** Red for overdue indicators, high-priority chips, delete actions, and clear-completed.
- **Background (#f7f4ef):** A warm cream that serves as the foundation for all pages, providing a softer, more organic feel than pure white.
- **Surface (#fffaf3):** An even warmer off-white used for card surfaces, creating a paper-like texture.
- **Surface Strong (#ffffff):** Pure white for ring cutouts and high-contrast card surfaces.
- **Text (#202433):** A near-black navy for maximum readability on the warm background.
- **Muted (#687083):** A medium-gray-blue for secondary text, placeholders, and non-interactive metadata.

### Dark Mode

- **Primary (#8b7cff):** A brighter, slightly more saturated purple for dark mode to maintain contrast.
- **Success (#34d399):** A brighter emerald.
- **Danger (#fb7185):** A softer pink-red for reduced visual strain in dark mode.
- **Background (#11131c):** A very dark navy-blue instead of pure black, to feel modern and deep.
- **Surface (#171a24):** A slightly lighter dark navy for cards.
- **Surface Strong (#1d2130):** The lightest dark surface for elevated elements.
- **Text (#f5f7fb):** A near-white with a hint of blue.
- **Muted (#9aa3b2):** A medium gray-blue.

### Usage Rules

- Primary is used for **one main action per view** (the add-todo button, the save button).
- Danger is reserved for destructive actions (delete, overdue indicators) and **not** used for neutral elements.
- The background gradient layers primary and secondary as subtle radial glows (`radial-gradient(circle at top left, primary at 16% opacity, secondary at 12% opacity)`).

## Typography

The typography strategy uses a single variable typeface — **Satoshi** (Indian Type Foundry) — with a weight axis from 300 to 900, creating hierarchy across two distinct weight clusters without introducing multiple font families.

- **Headings (850–900 weight):** Ultra-bold, tight letter-spacing (`-0.03em` to `-0.035em`). Used for greeting, section titles, modal headers, and progress display.
- **Title (700 weight):** Semi-bold with `-0.02em` tracking. Used for todo item titles.
- **Body (400 weight):** Regular weight for descriptions and paragraph text. `line-height: 1.5` ensures readability.
- **Labels (750–850 weight):** Upper-case or high-weight for metadata, section labels, and chips. Often paired with `0.05em–0.08em` letter-spacing for a crafted feel.
- **Chips (750 weight, 10px):** The smallest visible type, used for metadata chips on todo items. Highly compressed to fit multiple chips per row.

All numeric weights used: 400, 500, 600, 650, 700, 750, 800, 850, 900. The 850 weight is the most distinctive — heavier than the typical "extra-bold" (800) and visually anchors the UI.

Satoshi was chosen over Inter for its warmer, more approachable character — it carries the "well-organized paper notebook" personality better than a neutral grotesque, with softer terminals and a friendlier aperture that matches the brand's playful warmth.

## Layout & Spacing

The layout uses a **single-column fluid grid** optimized for mobile (Ubuntu Touch phone screen). A strict spacing scale based on 18px (`--dotodo-card-padding`) as the base unit maintains consistent rhythm.

### Layout Rules

- **Content max-width:** 720px, centered. The list page and editor page both constrain to this.
- **Cards:** Rounded at 15–16px with 18px internal padding, 1px card-border, and soft shadow.
- **Todo list items:** 8px vertical gap between items in collapsed groups.
- **Group headers:** 24px padding-top, 8px padding-bottom, with a top border separator between non-first groups.

### Responsive Behavior

- Below 640px: progress ring shrinks (62px → 56px), progress panel height reduces (112px → 104px), composer padding reduces.
- The type filter row and composer type chips are horizontally scrollable (no wrapping).

## Elevation & Depth

Depth is achieved through **card-based layering** with subtle shadows rather than heavy drop shadows. The system uses three shadow levels:

- **Soft** (`0 14px 34px rgba(31, 41, 55, 0.1)` / dark: `0 16px 40px rgba(0, 0, 0, 0.28)`): Used for elevated surfaces like modals and bottom sheets.
- **Card** (`0 8px 24px rgba(31, 41, 55, 0.08)` / dark: `0 8px 22px rgba(0, 0, 0, 0.2)`): Default card shadow, used for todo items, progress panel, composer, menu brand card.
- **Pressed** (`0 4px 12px rgba(31, 41, 55, 0.14)`): Used for active/pressed state on cards.

The background uses a **subtle radial gradient** (primary at top-left, secondary at bottom-right, each at 12–16% opacity) on top of the solid background color, creating gentle atmospheric depth without distracting from content. No background texture is applied — the page uses a clean gradient canvas. The notebook metaphor lives in the font choices and tone, not in decorative lines.

Backdrop blur (`18px`) is applied to card and composer surfaces for a frosted-glass effect.

Bottom sheets (`TodoItemEditorSheet`) use `0 -18px 44px rgba(31, 41, 55, 0.16)` shadow on the top edge to create the illusion of lifting from the content below.

## Shapes

The shape language is defined by **soft, approachable roundness**:

- **Cards:** 15–16px border radius — the dominant shape.
- **Buttons:** Fully pill-shaped (`9999px` border radius), both primary and icon buttons.
- **Chips:** Fully pill-shaped, 24px minimum height.
- **Input fields:** 14px border radius with a 1px card-border.
- **Type icons:** 10px border radius on a 28×28px grid.
- **Edit fields:** 14px radius with focus-within border highlight.
- **Subtask items:** 12px radius, 1px border.
- **Progress bar:** 999px border radius for the track and fill.
- **Circular elements:** Progress ring (62px), weekday picker buttons (36px, 50% radius), subtask empty state icon (42px, 14px radius), menu brand icon (42px, 16px radius).

No sharp corners exist in the system — every rectilinear element is radiused.

## Motion

Motion follows a **spring-like ease-out curve** — `cubic-bezier(0.16, 1, 0.3, 1)` — that feels natural and responsive without being bouncy.

### Timing Tokens

- **Fast** (`180ms` linear): Hover/press state transitions, color changes, simple opacity toggles.
- **Medium** (`400ms` ease): Expand/collapse animations, rotate chevrons, search panel, progress bar width.
- **Soft** (`650ms` ease): Animated height changes, visibility transitions with delay for smooth reveals.

### Keyframe Animations

- **`taskEnter`:** 0.35s — new todo items fade in and slide down (-10px → 0).
- **`stampInk`:** 0.5s — completed items display a brief checkmark stamp that zooms from 0.3→1.1 scale, then fades out while floating upward. The signature completion ritual.
- **`fadeIn`:** 0.24s — generic item entrance (opacity + translate).
- **`slideOut`:** 0.22s — generic item exit (translateX 100%).

### Interaction Feedback

- Cards and chips scale down slightly on press/active (0.998x for cards, 0.95x for chips, 0.88x for icon buttons).
- Chips have a brief shadow lift on press.
- The add-todo button has a persistent glow shadow that disappears when disabled.
- Group headers reduce opacity on press.

### Reduced Motion

When `prefers-reduced-motion: reduce` is active, all animations, transitions, and scroll behaviors are set to `0.01ms` duration via a global CSS rule.

## Components

### Cards

The foundational container. Used for todo items, progress panel, composer, menu brand, and empty states. Each card has:
- `--dotodo-card` background (translucent, backdrop-blur 18px)
- 1px `--dotodo-card-border` border
- `--dotodo-shadow-card` shadow
- 16px border radius

**State variants:**
- **Overdue:** 4px red left border, danger gradient background, radial danger glow overlay (multiply blend in light, screen blend in dark).
- **Completed:** Green-tinted gradient left, success border, reduced opacity (0.88), completionPulse + completionGlow animations. Title/description get muted color and line-through.

### Todo Row (`TodoItem`)

The most detailed component. Renders:
- **Checkbox:** IonCheckbox, toggles completion, primary-colored when checked.
- **Type icon:** 28×28px grid icon colored by `itemType`:
  - **todo** (listOutline) → primary background/color
  - **shopping** (cartOutline) → tertiary (teal)
  - **note** (documentTextOutline) → warning (amber)
  - **checklist** (checkmarkDoneOutline) → success (green)
- **Title:** 15px, 700 weight, `-0.02em` tracking. Line-through when completed.
- **Description:** 11px muted, 2-line clamp, 110-char truncation.
- **Metadata chips row:** Flex-wrap row of small chip elements:
  - **Due date chip:** Shows relative date ("Today", "Tomorrow", "Wed", "Jan 5", "Overdue"). Overdue items use danger styling with alertCircleOutline icon. Clicking opens IonPopover with IonDatetime.
  - **Priority chip:** Cycles undefined → low → medium → high → undefined on click. Each level has distinct color (success/warning/danger).
  - **Subtask chip:** Shows checkmarkDoneOutline + "completed/total". Only if subtasks exist.
  - **Recurrence chip:** Shows repeatOutline + frequency label. Only if recurrence exists.
  - **Quick action chip:** "+ subtask" if no subtasks exist.
- **Progress bar:** IonProgressBar below chips, shows subtask completion.

### Progress Panel

Top section of the main list page:
- 62px circular conic-gradient ring showing completion percentage.
- Title ("X of Y done"), subtitle ("Your notebook is waiting" / "All pages checked off" / "X tasks left").
- Search toggle button that expands an IonSearchbar with animated height transition (112px → 176px).
- Card surface with backdrop-blur.

### Composer (`TodoInput`)

Input card for adding new todos:
- Clean, unadorned input surface with no background texture.
- IonInput with type-aware placeholder text.
- 46×46px circular primary add button with glow shadow.
- Horizontal-scrolling type chip row (Task / Shop / Note / Check) below the input, each with underline indicator on active state.

### Type Filter Row

Four pill buttons in a horizontally scrollable row:
- Task, Shop, Note, Check.
- Active state: primary background, primary contrast text, primary glow shadow.
- Inactive: transparent, muted text, low opacity (0.72).

### Todo List Groups

Collapsible sections for organizing todos by due-date proximity:
- **Overdue** (danger red) — past due dates.
- **Today** (primary purple) — due today.
- **Tomorrow** (secondary purple) — due tomorrow.
- **Upcoming** (teal) — within 2–7 days.
- **Later** (muted) — beyond 7 days or no due date.
- **Completed** (success green).

Each group header: icon + title + count badge + rotating chevron. "Overdue" and "Today" are expanded by default. Groups are separated by a top border.

### Empty State

Centered `IonCard` with:
- 76px circular icon container with primary gradient tint.
- "Blank page" / "No matches" heading (notebook-metaphor tone).
- Contextual subtitle: "Your notebook is empty — what would you like to write?" (no tasks, no filter), "Start with a [type] — what's on your mind?" (filter by type), "Nothing here with that tag. Try another?" (filtered), or search results text.
- Contextual message based on empty reason (no tasks, no search results, no matching filter).

### Side Menu (`Menu`)

IonMenu overlay with:
- **Brand section:** 42px gradient circle (primary → secondary) with checkmark icon, "dotodo2" title, "X open tasks" count.
- **Lists section:** "All Lists" (default) + custom lists, each with folderOpenOutline icon. Selecting applies `--dotodo-primary-soft` background.
- **Create list row:** Text input + add button.
- **Clear completed row:** Danger-styled, shows completed count badge.

### Bottom Sheet Editor (`TodoItemEditorSheet`)

IonModal with breakpoints at 0.45, 0.72, 1.0:
- Draggable handle.
- Header with title, close, delete (trash), save (checkmark) buttons.
- `EditorDetailsSection`: Title IonInput (18px, 750 weight, underline focus effect) and Description IonTextarea (autoGrow, 15px).
- `SubtasksSection`: Checkbox + inline rename + delete on hover. Empty state with dashed border and encouragement text.
- `AddSubtaskRow`: Input + add button.

### Full-Page Editor (`TodoEditPage`)

Route `/task/:id/edit`:
- Header toolbar: back button, centered "Edit task" title (17px, 850 weight), delete and save action buttons.
- Status chip: color-coded dot by item type + "Active task" / "Completed task".
- Same EditorDetailsSection + RepeatSection (for todo type) + SubtasksSection.
- Content max-width: 720px, centered.

### Repeat Section

Recurrence configuration (only for `itemType === 'todo'`):
- **Frequency chips:** Daily, Weekdays, Weekly, Monthly, Yearly, Custom. Active chip gets primary glow shadow.
- **Weekly day picker:** S M T W T F S circular (36px, 50%) chip picker, multi-select.
- **Custom panel:** Interval stepper (minus/plus) + unit selector (Days/Weeks/Months/Years via IonSelect action sheet).
- **End date:** IonToggle for "Repeat until" with IonDatetime calendar.
- **Next occurrence preview:** Computed next due date display.
- **Remove button:** Danger-styled.

## Do's and Don'ts

- Do use the primary purple color for **all** interactive elements (buttons, active filters, checkboxes, progress bars) to maintain a cohesive interactive language.
- Do use type icons (todo/shopping/note/checklist) consistently — every todo item shows one, and it matches the `itemType` field.
- Do use overdue (danger-red) and completed (success-green) visual states as the primary feedback mechanisms for task status.
- Do use chips for all metadata (dates, priority, counts) — never render this information as raw text in the todo row.
- Do prefer Ionic components (IonButton, IonChip, IonPopover, IonDatetime, IonModal, IonCheckbox) over custom CSS for interactive elements.
- Don't mix the two editing surfaces (bottom sheet + full-page editor) for the same workflow — the bottom sheet is for quick inline edits; the full-page editor is for deep task configuration with recurrence.
- Don't use more than three chip colors in a single todo row — the visual density becomes overwhelming.
- Don't use pure black (`#000`) or pure white (`#fff`) for backgrounds — always use warm off-white (cream) or dark navy-blue.
- Don't add a dark mode toggle — system preference only. The app respects `prefers-color-scheme: dark`.
- Do maintain WCAG AA contrast ratios: primary text on bg/surface must exceed 4.5:1. The primary purple (#6c5ce7) on white surfaces passes at 4.8:1.
- Don't display `quantity` and `price` fields — they exist on the Todo type but have no UI implementation yet.
- Don't use the `@ionic/storage` service — Zustand persist middleware with localStorage is the active persistence layer.
