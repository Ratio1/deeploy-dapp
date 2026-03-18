# Deeploy dApp

Ratio1's Deeploy front-end for deploying and operating services on the Ratio1 network. The app is built with Next.js (App Router) and provides wallet-based authentication, Deeploy job management, tunneling setup, and project drafting tools.

## Features

- Wallet sign-in with SIWE via ConnectKit/Wagmi (Base & Base Sepolia networks pulled from `src/lib/config.ts`).
- Create and manage Deeploy jobs and projects; drafts are stored locally with Dexie for offline-friendly editing.
- Monitor running deployments, resend commands, scale workers, and review Deeploy API responses.
- Cloudflare tunnel management with signed messages to fetch and store secrets securely.
- Service catalog with scripted additions (`npm run add-service`) and validation (`npm run validate-services`).
- Shared contexts for authentication, blockchain state, tunneling, and deployment data (`src/lib/contexts`).

## Getting Started

Prerequisites: Node.js 20+ and npm.

1. Install dependencies:

```
npm install
```

2. Create `.env.local` (prefer this over `.env`):

```
NEXT_PUBLIC_ENVIRONMENT=devnet         # devnet | testnet | mainnet
NEXT_PUBLIC_API_URL=http://localhost:5000  # Deeploy edge_node base URL
NEXT_PUBLIC_DEV_ADDRESS=0xYourDevWallet    # optional; forces this address in dev
NEXT_PUBLIC_APP_VERSION=local              # optional; shown in the UI footer
```

- `NEXT_PUBLIC_API_URL` should point to your running [edge_node](https://github.com/Ratio1/edge_node) instance or the hosted Deeploy API.
- `NEXT_PUBLIC_ENVIRONMENT` selects the chain and backend/oracle endpoints defined in `src/lib/config.ts`.

3. Start the dev server (HTTPS by default):

```
npm run dev
```

Visit https://localhost:3000 and trust the local certificate if prompted.

## Usage Notes

- Authentication uses SIWE; tokens (`accessToken`, `refreshToken`) are kept in `localStorage` and reused by the Axios interceptors in `src/lib/api`.
- Most protected routes live under `app/(protected)/…`; the public login screen is under `app/(public)/login`.
- Draft projects/jobs are stored in IndexedDB (`src/lib/storage/db.ts`); clearing browser storage removes drafts.
- When pointing to a local edge_node, start that server first, then set `NEXT_PUBLIC_API_URL` to its port (e.g., `http://localhost:5000`).

### Dynamic Env Model

Container and native plugins now use a UI-facing `DYNAMIC_ENV_UI` model that compiles to backend `DYNAMIC_ENV` entries:

- `static` – fixed string fragment
- `host_ip` – host IP shortcut
- `container_ip` – shortcut for another plugin's `CONTAINER_IP`
- `plugin_value` – generic semaphore lookup from another plugin by `provider` + exported `key`

Known plugin signatures expose preset keys in the UI. Custom or unknown signatures fall back to manual key entry, so user-defined semaphore exports remain accessible without exposing raw `shmem` in the normal form.

Generic/container plugins also use a normalized `EXPOSED_PORTS` model in the request payload. The standard UI edits container ports and optional per-port Cloudflare tokens; host-port mapping remains backend-managed.

## Scripts

- `npm run dev` – Next.js dev server (`next dev --turbo --experimental-https`).
- `npm run build` / `npm run start` – production build and serve.
- `npm run lint` – ESLint with the project rules.
- `npm run add-service` – interactive wizard to append a service to `src/data/services.ts`.
- `npm run validate-services` – checks service definitions, color variants, and dynamic env types.
- `npm run test:dynamic-env-schema` – validates the UI `DYNAMIC_ENV_UI` schema.
- `npm run test:plugin-semaphore-keys` – verifies built-in semaphore-key mappings and custom fallback.
- `npm run test:dynamic-env-ui` – checks provider/key selection helpers and dependency-graph wiring.
- `npm run test:dynamic-env-serialization` – checks `DYNAMIC_ENV_UI` request serialization.
- `npm run test:dynamic-env-roundtrip` – checks recovery/import/read-only round-tripping of semaphore-backed values.

## Project Structure

- `app/` – Next.js App Router entrypoints (`(public)` and `(protected)` route groups, layouts, error pages).
- `src/components/` – feature components (auth, create-job, deeploys, tunnels, etc.).
- `src/shared/` – shared UI primitives and layout helpers.
- `src/lib/` – configs, API clients (Deeploy, backend, oracles, tunnels), providers, contexts, hooks, utilities.
- `src/data/` – static data (services catalog, color types, dynamic env types) and scripts targets.
- `src/blockchain/` – contract helpers and wagmi/viem bindings.
- `public/` – static assets and manifest; `certificates/` holds local HTTPS certs for dev.
- `scripts/` – maintenance scripts for services and data validation.

## Deployment

Dockerfiles are provided per environment (`Dockerfile_devnet`, `_testnet`, `_mainnet`) and expect build args `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ENVIRONMENT`, and `VERSION` (mapped to `NEXT_PUBLIC_APP_VERSION`).

## Testing

For the dynamic-env and exposed-port flows, run at least:

```bash
npm run test:dynamic-env-schema
npm run test:plugin-semaphore-keys
npm run test:dynamic-env-ui
npm run test:dynamic-env-serialization
npm run test:dynamic-env-roundtrip
npm run lint
npx tsc --noEmit --incremental false
```

For visual QA, use the preview route:

```bash
npm run dev
# open /playwright-preview
```
