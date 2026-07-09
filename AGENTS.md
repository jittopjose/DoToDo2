# dotodo2

## Architecture

This is a **dual-stack** app: a Qt5 QML shell (`main.cpp` + `qml/Main.qml`) embeds the real UI — a React/Ionic SPA — inside a `WebEngineView` with a `WebChannel` bridge for native↔JS communication. The QML layer is thin; almost all UI logic lives in the Ionic app.

- **QML shell** (`qml/`, `main.cpp`, `CMakeLists.txt`) — Qt5, Lomiri Components, WebEngine
- **Ionic app** (`ionic-app/`) — React 19, TypeScript, Ionic React 8, Zustand, Vite, Vitest, Cypress
- **Build bridge**: Vite outputs into `web/` (gitignored), which `qml.qrc` embeds into the Qt binary
- **Packaging**: Click (Ubuntu Touch) via `clickable.yaml` and Snap via `snapcraft.yaml`

## Commands

Run all Ionic commands from `ionic-app/`, never from the root:

```sh
cd ionic-app
source "$HOME/.nvm/nvm.sh"  # required — nvm is not auto-loaded
npm run dev                  # Vite dev server (port 5173 for Cypress baseUrl)
npm run build                # tsc + Vite; writes to ../web/
npm run lint                 # ESLint (flat config)
npm run test.unit            # Vitest
npm run test.e2e             # Cypress
npm run build:clickable      # npm run build + clickable clean + clickable desktop
```

Capacitor commands (Node >=22 required — switch via `nvm use 22`):
```sh
cd ionic-app
source "$HOME/.nvm/nvm.sh"
nvm use 22
npx cap add android        # one-time platform add
npx cap sync               # sync plugins + web assets to native
npx cap open android       # open in Android Studio
```

Full-stack build (requires Qt5 dev packages + intltool):
```sh
# from root dir:
cmake -S . -B build/x86_64-linux-gnu
cmake --build build/x86_64-linux-gnu
```

Clickable build (Ubuntu Touch):
```sh
clickable desktop   # from root dir
```

## Key facts

- **Memory history**: The Ionic app uses `createMemoryHistory()` — no browser URL syncing. Routes (`/list/:name`, `/task/:id/edit`) exist only in memory.
- **Build output = web/**: `vite.config.ts` writes `app.js`, `app.css`, etc. to `../web/`. This is the runtime content the QML shell loads. **Never edit `web/` directly** — it's generated and gitignored.
- **State**: Zustand store at `src/features/todos/store/`.
- **Storage**: `@ionic/storage` (IndexedDB-backed), initialized in `src/services/storage.service.ts`.
- **Barcode scanning**: Dual-path architecture — `src/services/barcode.service.ts` checks `Capacitor.isNativePlatform()`. Native: `@capacitor-mlkit/barcode-scanning`. Web: `barcode-detector` ponyfill (ZXing WASM in `public/wasm/`). Camera requires Qt WebEngine `onFeaturePermissionRequested` handler (`qml/Main.qml`) and `"camera"` AppArmor policy (`dotodo2.apparmor`).
- **Types**: `Todo`, `TodoSubtask`, `TodoPriority`, `TodoFilter` at `src/features/todos/types.ts`.
- **Dark mode**: System-preference only (`dark.system.css`), not toggleable in-app.
- **Translations**: intltool + gettext (`po/` directory). Desktop file `.desktop.in` uses `_Name`. Not wired into the Ionic SPA.

## Packaging quirks

- `snapcraft.yaml` targets `core24` with Lomiri UI toolkit.
- `clickable.yaml` uses cmake builder, minimum Clickable 8.
- `manifest.json.in` uses CMake-configured `@CLICK_ARCH@` / `@CLICK_FRAMEWORK@`.
- `dotodo2.apparmor` is the AppArmor profile for the Click package.

## UI conventions

- **Prefer Ionic components over custom CSS.** Use `IonButton`, `IonToggle`, `IonPopover`, `IonDatetime`, `IonModal`, `IonChip`, etc. instead of styling raw elements with CSS. Custom CSS should be a last resort for layout tweaks that Ionic doesn't provide a prop for.
- **Follow the patterns in `TodoItem.tsx`** — it's the most mature component and sets the precedent for how to use Ionic (e.g., `IonPopover` + `IonDatetime` for calendar picking).
- **Ionic CSS variables** (e.g., `--dotodo-primary`, `--dotodo-muted`, `--dotodo-surface-strong`) are available for minor color/spacing adjustments when needed.

## Existing agent instructions

- `.kilo/CONTEXT.md` — maintained project context (nvm, ionic dir, useful commands)
- `.kilo/agents/architect.md` — Kilo architect agent (read-only, plan-writing mode)
- `.kilo/agents/frontend-specialist.md` — Kilo frontend agent (React/TS/CSS focus)

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **DoToDo2** (487 symbols, 584 relationships, 1 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit without asking the user first. Present the diff for review before committing.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/DoToDo2/context` | Codebase overview, check index freshness |
| `gitnexus://repo/DoToDo2/clusters` | All functional areas |
| `gitnexus://repo/DoToDo2/processes` | All execution flows |
| `gitnexus://repo/DoToDo2/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
