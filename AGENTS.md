# Repository Guidelines

## Project Structure & Module Organization
The Vite + React app lives in `src/` with `main.tsx` mounting `App.tsx`. Feature-specific UI is grouped under `src/components` (e.g., `create-project`, `deeploys`), while route screens sit in `src/pages`. Shared hooks/utilities are in `src/lib` and `src/shared`, smart-contract adapters in `src/blockchain`, and schema/types in `src/schemas`, `src/data`, and `src/typedefs`. Static assets live in `public/` and `src/assets/`; builds land in `dist/`.

## Build, Test, and Development Commands
Run all commands from the repo root:
- `npm run dev` launches the Vite dev server with HMR.
- `npm run dev:logs` adds verbose Vite diagnostics for debugging config issues.
- `npm run build` type-checks through `tsc -b` then emits a production bundle to `dist/`.
- `npm run lint` executes ESLint with the project’s React/TypeScript rules.
- `npm run preview` serves the last build for local production smoke tests.

## Deeploy API Integration
Deeploy workflows talk to the [edge_node](https://github.com/Ratio1/edge_node) API through wrappers in `src/lib/api/deeploy.ts`. Configure the base URL by setting `VITE_API_URL` and `VITE_ENVIRONMENT` in your `.env`; `src/lib/config.ts` routes requests across devnet/testnet/mainnet. Local storage must expose `accessToken`/`refreshToken` to satisfy the Axios interceptors. When working against a local edge node, run its server first, then point `VITE_API_URL` to the exposed port (e.g., `http://localhost:5000`). Mock responses for offline work by stubbing the helpers (`createPipeline`, `getApps`, etc.) instead of bypassing the provider.

## Coding Style & Naming Conventions
Prettier (`.prettierrc`) enforces four-space indentation, single quotes, semicolons, and Tailwind class sorting—format before committing. Use PascalCase for components, camelCase for functions and state, and kebab-case for feature folders. Respect path aliases from `tsconfig.app.json` (such as `@components/...`) to avoid brittle relative imports. ESLint relaxes certain hook rules; still supply explicit dependency arrays and delete unused code paths.

## Testing Guidelines
Automated tests are not yet wired into `package.json`. Prefer Vitest plus React Testing Library when adding coverage; place specs alongside source as `*.test.ts(x)` or under `src/__tests__/`. Stub Deeploy API calls and blockchain providers to keep tests deterministic, and document manual QA steps in your PR until the suite matures.

## Commit & Pull Request Guidelines
History follows Conventional Commit prefixes (`fix:`, `feat:`, etc.); keep summaries concise and imperative (<72 chars). Separate logical changes—UI tweaks, contract bindings, and config updates should ship in distinct commits. PRs need a clear problem statement, bullet summary of changes, evidence for UI updates (screenshots/GIFs), linked work items, and callouts for required env/config shifts.
