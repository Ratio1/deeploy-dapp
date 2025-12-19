# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project. Routes and layouts live in `app/` (file-based routing via `page.tsx`, `layout.tsx`, `not-found.tsx`, and dynamic segments like `[id]`). The codebase uses route groups for organization, e.g. `app/(public)` and `app/(protected)` (the protected group is gated by `app/(protected)/protected-layout.tsx`).

Most feature UI remains in `src/`: feature-specific components are grouped under `src/components` (e.g., `create-project`, `deeploys`, `tunnels`), shared UI/logic in `src/shared`, hooks/utilities/contexts/providers in `src/lib`, smart-contract adapters in `src/blockchain`, and schema/types in `src/schemas`, `src/data`, and `src/typedefs`. Static assets live in `public/` and `src/assets/`. Next build output is `.next/` (a legacy `dist/` directory may exist from pre-Next builds and should not be treated as the Next build output).

## Build, Test, and Development Commands

Run all commands from the repo root:

- `npm run dev` launches the Next.js dev server (`next dev --turbo --experimental-https`).
- `npm run dev:logs` enables verbose Next.js diagnostics (`NEXT_DEBUG=1 next dev --turbo --experimental-https`).
- `npm run build` creates a production build (`next build`, outputs to `.next/`).
- `npm run start` serves the production build locally (`next start`).
- `npm run lint` executes ESLint with the project’s React/TypeScript rules.

## Deeploy API Integration

Deeploy workflows talk to the [edge_node](https://github.com/Ratio1/edge_node) API through wrappers in `src/lib/api/deeploy.ts`. Configure the base URL by setting `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_ENVIRONMENT` (and optionally `NEXT_PUBLIC_DEV_ADDRESS`) in your env file (prefer `.env.local`); `src/lib/config.ts` routes requests across devnet/testnet/mainnet. Local storage must expose `accessToken`/`refreshToken` to satisfy the Axios interceptors. When working against a local edge node, run its server first, then point `NEXT_PUBLIC_API_URL` to the exposed port (e.g., `http://localhost:5000`).

Because this is Next.js, be mindful of client/server boundaries: modules that access `localStorage` (like `src/lib/api/deeploy.ts`) must only run in client components/hooks (files with `'use client'`) and should not be imported/executed from server components.

## Coding Style & Naming Conventions

Prettier (`.prettierrc`) enforces four-space indentation, single quotes, semicolons, and Tailwind class sorting—format before committing. Use PascalCase for components, camelCase for functions and state, and kebab-case for feature folders. Respect path aliases from `tsconfig.json` (such as `@components/...`) to avoid brittle relative imports. In the `app/` router, add `'use client'` to components that use hooks, browser APIs, or context providers.

## Testing Guidelines

Automated tests run with Vitest (`npm test`). Place specs alongside source as `*.test.ts(x)` or under `src/__tests__/`. When adding new functions, include coverage for the expected behavior and edge cases. Run the test suite (or targeted tests) before completing implementations. Stub Deeploy API calls and blockchain providers to keep tests deterministic, and document manual QA steps in your PR until the suite matures.

## Commit & Pull Request Guidelines

History follows Conventional Commit prefixes (`fix:`, `feat:`, etc.); keep summaries concise and imperative (<72 chars). Separate logical changes—UI tweaks, contract bindings, and config updates should ship in distinct commits. PRs need a clear problem statement, bullet summary of changes, evidence for UI updates (screenshots/GIFs), linked work items, and callouts for required env/config shifts.
