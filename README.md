# Deeploy dApp

Ratio1's Deeploy web control plane for deploying, operating, and monitoring services on the Ratio1 ecosystem.

## Need, Objective, Purpose

### Need

Deeploy operators need one place to:
- Authenticate with wallet identity.
- Prepare deployment configurations safely before submission.
- Operate live jobs (monitor, restart/stop, scale, extend).
- Manage tunnel exposure for externally reachable services.

### Objective

Provide a production-ready UI that connects blockchain identity, Deeploy APIs, and operational workflows into one consistent experience.

### Purpose

Reduce operational friction for CSPs/operators by combining deployment authoring, runtime control, and account/tunnel administration in a single app.

## Usability and Features

### Core user journeys

1. Connect wallet and authenticate via SIWE.
2. Pass access gating (oracle ownership or escrow access).
3. Build project/job drafts locally before deployment.
4. Deploy, inspect, edit, and extend running jobs.
5. Manage Cloudflare-backed tunnels and hostnames.
6. Maintain account profile, delegates, invoicing, and burn reports.

### Feature map

- Wallet + SIWE authentication powered by ConnectKit/Wagmi.
- Protected application surface under `app/(protected)` with redirect-based gating.
- Draft-first workflow using IndexedDB (Dexie) for project/job persistence.
- Deployment operations through Deeploy API wrappers in `src/lib/api/deeploy.ts`.
- Runtime management actions include app commands (`RESTART`, `STOP`), instance commands, worker scale-up, and edit/extend flows integrated with contract reads/writes.
- Tunnel operations in `src/lib/api/tunnels.ts` include signed secret retrieval, tunnel lifecycle actions, and alias/hostname management.
- Account center features include invoicing, profile branding, escrow delegate management, and burn report export.
- Service catalog tooling is provided via `npm run add-service` and `npm run validate-services`.

### Quick start (usability-first)

Prerequisites:
- Node.js 20+
- npm
- Running Deeploy edge API (`edge_node`) if working locally

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```env
NEXT_PUBLIC_ENVIRONMENT=devnet
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_DEV_ADDRESS=0xYourDevWallet
NEXT_PUBLIC_APP_VERSION=local
```

3. Start development server (HTTPS):

```bash
npm run dev
```

4. Open `https://localhost:3000` and trust the local certificate if prompted.

5. Connect wallet, sign SIWE message, and continue into protected routes.

### Daily operator notes

- Tokens (`accessToken`, `refreshToken`) are stored in `localStorage` and refreshed by Axios interceptors.
- Clearing browser storage clears local drafts.
- Local API work requires `edge_node` to be running before opening the dApp.

## Technical Reference

### Stack

- Next.js 16 App Router (`output: 'standalone'`)
- React 18 + TypeScript
- Wagmi + ConnectKit + SIWE
- React Query
- HeroUI
- Dexie (IndexedDB)
- Axios
- Zod + React Hook Form

### Architecture overview

- Routing is split between `app/(public)` for unauthenticated pages (for example `login`) and `app/(protected)` behind `ProtectedLayout`.
- Providers are composed in `src/lib/providers/wrappers.tsx`: Web3, React Query, HeroUI, Authentication, Blockchain, Deployment, Tunnels, Interaction.
- Runtime integrations are centralized in `src/lib/config.ts` (environment-specific endpoints/contracts/epoch timing), `src/lib/api/deeploy.ts` (deployment API + refresh), `src/lib/api/backend.tsx` (backend operations/downloads), and `src/lib/api/tunnels.ts` (tunnel lifecycle).

### Environment model

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_ENVIRONMENT` | Yes | `devnet`, `testnet`, or `mainnet`; selects network/backend bundle in `src/lib/config.ts`. |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for Deeploy edge API. |
| `NEXT_PUBLIC_DEV_ADDRESS` | No | Dev-only forced wallet address shortcut. |
| `NEXT_PUBLIC_APP_VERSION` | No | Version string shown in UI (typically injected at build time). |

### Scripts

- `npm run dev`: Next development server with HTTPS and turbo.
- `npm run dev:logs`: Development server with verbose Next diagnostics.
- `npm run build`: Production build to `.next`.
- `npm run start`: Serve production build.
- `npm run lint`: ESLint validation.
- `npm run add-service`: Interactive generator to append service definitions.
- `npm run validate-services`: Validates services and required logo assets.

### Repository structure

- `app/`: Route entrypoints, layouts, and error pages.
- `src/components/`: Feature components (deployments, tunnels, account, auth, forms).
- `src/shared/`: Reusable UI primitives.
- `src/lib/`: API clients, providers, hooks, routes, config, storage, permissions.
- `src/blockchain/`: Contract ABIs and helpers.
- `src/data/`: Static service/config data.
- `src/schemas/`: Zod schemas.
- `src/typedefs/`: Shared type models.
- `scripts/`: Service tooling scripts.
- `.github/workflows/`: CI workflows for service validation and image publishing.

### CI/CD and release behavior

- `service_validation.yml` validates services on PRs to `develop` when title starts with `add_service:`.
- `build_devnet.yml` builds/pushes `ratio1/deeploy_ui:devnet` on `develop`.
- `build_testnet_mainnet.yml` builds/pushes `testnet` and `mainnet` images on `main`, and creates a semantic-versioned GitHub release.

### Docker deployment

- Environment-specific Dockerfiles: `Dockerfile_devnet`, `Dockerfile_testnet`, `Dockerfile_mainnet`.
- Build args used by images: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ENVIRONMENT`, `NEXT_PUBLIC_DEV_ADDRESS`, `VERSION` (mapped to `NEXT_PUBLIC_APP_VERSION`).

### Quality and testing status

- Automated tests are not yet wired into `package.json`.
- Current baseline quality gate is `npm run lint`.
- For non-trivial changes, add targeted tests and document manual QA paths in PRs.
