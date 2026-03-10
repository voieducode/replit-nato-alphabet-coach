# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server (port 5000)
npm run build            # Build frontend (Vite) + bundle server (esbuild)
npm run validate         # Run format check, lint, type check, and tests (CI uses this)

npm run check            # TypeScript type check only
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format
npm run format:check     # Prettier check

npm test                 # Vitest watch mode
npm run test:run         # Vitest single run
npm run test:ui          # Vitest interactive UI
npm run test:coverage    # Vitest with coverage
```

## Architecture

React 18 + TypeScript frontend with an Express backend, built with Vite. Styling via Tailwind CSS v4 + Shadcn UI (Radix primitives). Routing with Wouter. Data fetching with TanStack React Query.

### Key directories

- `client/src/` — React app entry (`main.tsx` → `App.tsx`)
  - `components/quiz/` — Quiz feature (components + hooks)
  - `components/word-quiz/` — Word matching quiz feature
  - `components/settings/` — Settings UI
  - `components/shared/` — Shared utilities (speech, formatting)
  - `components/ui/` — Shadcn component library
  - `contexts/` — React contexts: theme, language, quiz state
  - `hooks/` — Custom hooks: speech recognition, quiz, theme, language
  - `lib/` — Utilities: NATO alphabet, word dictionary, spaced repetition, storage, i18n
  - `lib/translations/` — Language files
  - `types/` — TypeScript type definitions
- `server/` — Express API (`routes.ts`, `storage.ts`, `vite.ts` dev middleware)
- `shared/schema.ts` — Zod schemas shared between frontend and backend

### Path aliases

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

### Data flow

App wraps content with QueryClientProvider → ThemeProvider → LanguageProvider → Router. The single route (`/`) renders HomePage containing QuizSection, ConverterSection, WordQuizSection, and SettingsSection. User data persists in LocalStorage. Speech recognition/synthesis uses the Web Speech API.

## Testing

Vitest with `@vitest/browser` (Playwright/Chromium, headless). Tests are colocated in `__tests__/` directories next to source files. Test setup (`client/src/test/setup.ts`) mocks localStorage and Web Speech API, and runs Testing Library cleanup.

## Code style

- ESLint config: `@antfu/eslint-config` with TypeScript + React
- Prettier: single quotes, semicolons, trailing commas (es5), 80 char width
- Shadcn CLI configured with `new-york` style

## Deployment

GitHub Pages via CI/CD (`.github/workflows/ci.yml`). Custom domain: `nato-alphabet.voieduco.de`. Vite `base` is `/`. The deploy step adds `.nojekyll` and `CNAME` files to `dist/`. GitHub repo: `voieducode/replit-nato-alphabet-coach`.

## Preferences

- Do not add `Co-Authored-By` lines to commit messages
