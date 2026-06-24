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
