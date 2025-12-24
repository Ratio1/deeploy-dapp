# Repository Guidelines

## Project Context

This repository contains the Deeploy frontend, built with Next.js App Router. In addition to the core Deeploy application, this codebase hosts "Deeploy Cash" features: a server-mediated, fiat-based flow where end users do not interact directly with wallets or on-chain signing.

The goal is to preserve the existing Deeploy UI and UX as much as possible, while optionally routing sensitive actions (signing, payments, provisioning) through server-side endpoints instead of client-side blockchain calls.

When in doubt:

- UI structure and presentational components should remain unchanged.
- Privileged actions should move from client-side to server-side.
- New functionality should be added in isolated modules rather than modifying upstream code.

---

## Project Structure & Module Organization

This is a Next.js App Router project. Routes and layouts live in `app/` (file-based routing via `page.tsx`, `layout.tsx`, `not-found.tsx`, and dynamic segments like `[id]`).

Route groups are used for separation of concerns:

- `app/(public)` for public pages
- `app/(protected)` for authenticated dashboards

Most feature UI remains in `src/`:

- Feature-specific components in `src/components` (e.g. `deeploys`, `tunnels`)
- Shared UI and logic in `src/shared`
- Hooks, utilities, contexts, and providers in `src/lib`
- Deeploy API wrappers in `src/lib/api`
- Blockchain adapters in `src/blockchain`
- Schemas and types in `src/schemas`, `src/data`, `src/typedefs`

Cash-specific logic should be added in clearly separated modules
(e.g. `src/lib/cash`, `src/components/cash`) rather than altering upstream code.

Static assets live in `public/` and `src/assets/`.

---

## Client vs Server Responsibilities

Because this is a Next.js app, client/server boundaries matter.

### Client-side

- UI rendering
- User interaction
- Data fetching from internal API routes
- No private keys, no signing, no privileged blockchain calls

### Server-side (in this fork, with the relevant parts being moved from client-side to server-side)

- Calls to Deeploy API that require privileged context
- Message or transaction signing using a CSP wallet
- Payment verification (e.g. Stripe webhooks)
- Service provisioning and lifecycle management

---

## Deeploy API Integration

Core Deeploy workflows interact with the edge node API through wrappers in
`src/lib/api/deeploy.ts`.

Environment configuration:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ENVIRONMENT`
- optional `NEXT_PUBLIC_DEV_ADDRESS`

Requests are routed via `src/lib/config.ts` to devnet/testnet/mainnet.
Client-side Axios interceptors rely on `accessToken` and `refreshToken`
stored in local storage.

For Deeploy Cash flows, direct client-to-Deeploy API calls may be replaced
by internal server routes (`app/api/*`) that proxy or orchestrate requests.

---

## Build, Test, and Development Commands

Run all commands from the repo root:

- `npm run dev` – start Next.js dev server
- `npm run dev:logs` – verbose Next.js diagnostics
- `npm run build` – production build (outputs to `.next/`)
- `npm run start` – serve production build locally
- `npm run lint` – run ESLint

---

## Coding Style & Conventions

Prettier (`.prettierrc`) enforces formatting rules.
Use:

- PascalCase for components
- camelCase for functions and state
- kebab-case for feature folders

Respect path aliases from `tsconfig.json` (e.g. `@components/...`).
Add `'use client'` only when required (hooks, browser APIs, context).

Prefer composition and extension over modifying existing upstream components.

---

## Testing & Changes

Automated tests run with Vitest.
Stub Deeploy API and blockchain providers when testing.

Commits follow Conventional Commits (`feat:`, `fix:`, etc.).
PRs should clearly state whether changes are:

- upstream-neutral (safe for core Deeploy)
- Cash-specific (isolated and additive)

Avoid mixing refactors, features, and config changes in a single commit.
