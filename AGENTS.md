# AGENTS.md

This file is both:
- The repository operating guide for contributors and coding agents.
- The long-term memory ledger for meaningful discoveries, decisions, and changes.

Every agent must treat this document as a living source of truth and keep it current.

## 1) Non-Negotiable Operating Protocol

### 1.1 Long-Term Memory Requirement

For every important discovery, change, risk, or insight, append a new entry to `## 9) Long-Term Memory Log`.

Important means:
- Architectural behavior that is easy to forget and impacts future work.
- Any change to behavior, contracts, APIs, configuration, CI/CD, or deployment.
- Any bug root cause, recurring pitfall, or limitation discovered during work.
- Any decision with tradeoffs that future agents should not rediscover from scratch.

Memory rules:
- Append-only by default.
- Never silently rewrite or remove older entries.
- If an old entry is wrong, add a correction entry referencing the older one.
- Keep entries factual and verifiable (include file paths or commands when possible).

### 1.2 Mandatory BUILDER-CRITIC Iteration (Adversarial Check)

For every modification, agents must run a BUILDER-CRITIC loop before marking work done.

Process for each change set:
1. `BUILDER`: Implement the intended change.
2. `CRITIC (adversarial)`: Take the radical reverse position and try to break the change.
3. `BUILDER`: Refine/fix based on critic findings.
4. Repeat steps 2-3 until no high-severity criticism remains.
5. Record the result in the Long-Term Memory Log.

Minimum critic checklist:
- Does this introduce regressions in protected/public route flow?
- Does this break client/server boundaries (for example `localStorage` usage on server)?
- Does this violate existing API/auth/token assumptions?
- Does this create hidden config/env coupling?
- Does this reduce maintainability or observability?

Completion gate:
- No unresolved high-severity critic findings.
- All changed docs are internally consistent with repository reality.
- Validation commands (at least `npm run lint` for non-trivial edits) completed or explicitly reported as not run.

## 2) Project Purpose Snapshot

Deeploy dApp is Ratio1's web control plane for:
- Wallet-authenticated access (SIWE) to Ratio1 deployment capabilities.
- Creating and managing project/job deployments against Deeploy edge APIs.
- Monitoring running jobs, issuing commands, and adjusting resources.
- Managing tunnel connectivity and account-level operational settings.

## 3) Project Structure & Module Organization

This is a Next.js App Router project.

Routing:
- `app/` contains routes/layouts (`page.tsx`, `layout.tsx`, `not-found.tsx`, dynamic segments).
- Route groups separate access paths: `app/(public)` for public pages (for example login) and `app/(protected)` for authenticated pages gated by `app/(protected)/protected-layout.tsx`.

Application code:
- `src/components/` feature UI (account, create-job, create-project, deeploys, tunnels, etc.).
- `src/shared/` shared UI primitives/utilities.
- `src/lib/` API clients, contexts, providers, hooks, routes, config, storage.
- `src/blockchain/` contract ABIs/helpers.
- `src/data/`, `src/schemas/`, `src/typedefs/` typed data and schemas.
- `public/` static assets (including service logos under `public/services`).

Build output:
- Next output is `.next/`.
- Ignore legacy `dist/` as build target.

## 4) Build, Test, and Development Commands

Run from repository root:
- `npm run dev` starts Next dev server with HTTPS (`next dev --turbo --experimental-https`).
- `npm run dev:logs` starts dev with additional debug logs.
- `npm run build` creates production build.
- `npm run start` serves production build.
- `npm run lint` runs ESLint.
- `npm run add-service` interactive service catalog entry generator.
- `npm run validate-services` validates service catalog and logos.

## 5) Integrations & Runtime Constraints

### 5.1 Deeploy / Backend / Oracles

- Environment routing lives in `src/lib/config.ts` and depends on `NEXT_PUBLIC_ENVIRONMENT` (`devnet`, `testnet`, `mainnet`), `NEXT_PUBLIC_API_URL`, optional `NEXT_PUBLIC_DEV_ADDRESS`, and optional `NEXT_PUBLIC_APP_VERSION`.
- Deeploy client: `src/lib/api/deeploy.ts`
- Backend client: `src/lib/api/backend.tsx`
- Oracles client: `src/lib/api/oracles.tsx`

### 5.2 Auth & Session

- Wallet auth uses ConnectKit + SIWE in `src/lib/providers/Web3Provider.tsx`.
- Access/refresh tokens are read from `localStorage` by Axios interceptors.
- Protected flow depends on signed-in state and fetched deployment context.

### 5.3 Client/Server Boundaries

Any module that reads `window` or `localStorage` is client-only. Do not import/execute those modules from server components.

### 5.4 Local Draft Persistence

Draft projects/jobs are stored in IndexedDB via Dexie (`src/lib/storage/db.ts`, DB name `ratio1-deeploy`).

### 5.5 Tunnels

Tunnel management uses `src/lib/api/tunnels.ts` plus signed payload flows in tunnels pages.

## 6) Coding Style & Naming

- Prettier (`.prettierrc`) enforces 4-space indentation, single quotes, semicolons, and Tailwind class sorting.
- Use PascalCase for components, camelCase for vars/functions/state, kebab-case for feature folders.
- Prefer path aliases from `tsconfig.json` (for example `@components/...`, `@lib/...`).
- Add `'use client'` for components using hooks/browser APIs/context.

## 7) Testing & Quality

- Automated test scripts are not yet wired in `package.json`.
- Add tests as `*.test.ts(x)` near source or in `src/__tests__/` when introducing non-trivial logic.
- Stub Deeploy API/blockchain providers in tests.
- Until broader tests exist, document manual QA steps in PRs.

## 8) Commit & PR Guidelines

- Use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, etc.).
- Keep commit subjects imperative and concise (<72 chars).
- Separate unrelated concerns into separate commits.
- PRs should include problem statement, change summary, proof (screenshots/GIFs for UI), linked work items, and env/config changes.

## 9) Long-Term Memory Log (Append-Only)

Entry template:

```
### [UTC YYYY-MM-DD HH:MM] [TYPE] Short Title
- Context:
- Evidence:
- Builder change:
- Critic challenge:
- Builder refinement:
- Outcome:
- Follow-up:
```

`TYPE` should be one of: `DISCOVERY`, `CHANGE`, `INSIGHT`, `RISK`, `DECISION`, `CORRECTION`.

### [UTC 2026-02-11 00:00] [DISCOVERY] Baseline architecture and flows reviewed
- Context: Full repository scan performed to seed long-term memory for future agents.
- Evidence: `app/`, `src/lib/config.ts`, `src/lib/api/*`, `src/lib/contexts/*`, `scripts/*`, `.github/workflows/*`, Dockerfiles.
- Builder change: None (discovery-only entry).
- Critic challenge: Could the scan miss important runtime assumptions?
- Builder refinement: Included auth/session, protected routing gate, Dexie draft persistence, tunnels flow, service scripts, and CI build behavior.
- Outcome: Baseline snapshot considered sufficient for future documentation and onboarding.
- Follow-up: Keep this log updated when architecture or environment assumptions change.

### [UTC 2026-02-11 00:00] [DECISION] Adopt mandatory BUILDER-CRITIC iterative pattern
- Context: User requested adversarial validation after every modification.
- Evidence: This AGENTS policy section `1.2 Mandatory BUILDER-CRITIC Iteration`.
- Builder change: Added explicit adversarial role-switch workflow and completion gates.
- Critic challenge: Could this become performative and not actionable?
- Builder refinement: Added concrete critic checklist and completion criteria tied to regressions, boundaries, config, and validation.
- Outcome: Future agents must include an adversarial check before completion and record it in memory.
- Follow-up: If future teams need stricter checks, extend critic checklist with security/performance-specific gates.

### [UTC 2026-02-11 00:15] [CHANGE] AGENTS.md upgraded to operational memory system
- Context: Repository instructions were guide-only and lacked durable project memory behavior.
- Evidence: Sections `1) Non-Negotiable Operating Protocol` and `9) Long-Term Memory Log (Append-Only)`.
- Builder change: Reworked AGENTS into a dual-purpose operating guide + append-only memory ledger with entry template.
- Critic challenge: Could the policy be too abstract to enforce in real tasks?
- Builder refinement: Added concrete update triggers, correction rules, and completion gates tied to verifiable checks.
- Outcome: Future agents now have explicit requirements for preserving discoveries and documenting decisions.
- Follow-up: Expand memory taxonomy if future workflows need security/performance-specific log categories.

### [UTC 2026-02-11 00:25] [CHANGE] README reorganized to usability-first then technical reference
- Context: README needed clearer articulation of need/objective/purpose and a user-journey-first structure.
- Evidence: `README.md` sections `Need, Objective, Purpose`, `Usability and Features`, and `Technical Reference`.
- Builder change: Rewrote README to lead with user value and workflows, then provide architecture/env/scripts/CI/CD details.
- Critic challenge: Could the rewrite drift from actual implementation or hide operational constraints?
- Builder refinement: Cross-checked claims against `app/`, `src/lib/config.ts`, `src/lib/api/*`, scripts, and GitHub workflows; tightened feature/architecture wording.
- Outcome: Documentation now supports onboarding from user intent to technical implementation without losing precision.
- Follow-up: Keep README synced with route additions, env variable changes, and new quality gates.

### [UTC 2026-02-11 00:40] [CHANGE] Job instance tag now shows alias before node address
- Context: Instance view previously displayed only the node address in the primary tag.
- Evidence: `src/components/job/JobInstances.tsx`.
- Builder change: Updated the instance tag format to render `<alias> <node-address>` using `jobAlias` followed by the existing copyable node address.
- Critic challenge: Could "alias" refer to per-node/server alias instead of job alias?
- Builder refinement: Used `jobAlias` because it is available in current instance view data and preserves zero-risk behavior; kept `CopyableValue` scoped to node address so copy action remains unchanged.
- Outcome: UI now presents alias + node address while node address remains copyable.
- Follow-up: If node/server alias is required, extend instance data model (oracles lookup/cache) and replace `jobAlias` in this tag.

### [UTC 2026-02-11 00:55] [CHANGE] Instance view now uses node alias, not job alias
- Context: Requirement clarified that displayed alias must be per-node alias.
- Evidence: `src/components/job/JobInstances.tsx`, `src/lib/api/oracles.tsx`.
- Builder change: Replaced displayed alias source with node alias fetched by node address; retained copy behavior for internal node address (`0xai...`).
- Critic challenge: Oracles API environments may differ on expected lookup query parameter for node address.
- Builder refinement: Added `getNodeInfoByAddress` with fallback queries (`eth_node_addr`, then `node_addr`) and graceful per-node fallback label (`Unknown node`) on fetch failure.
- Outcome: Instance tags now render `<node-alias> <node-address>` while node-address copy support remains unchanged.
- Follow-up: If available, cache node alias metadata at deployment-context level to avoid duplicate fetches across pages.

### [UTC 2026-02-11 13:53] [CHANGE] Added Neo4j Community service (HTTP-only on 7474)
- Context: User requested adding Neo4j Community Edition and explicitly asked to expose only HTTP on port `7474`.
- Evidence: `src/data/services.ts`, `public/services/neo4j.svg`, `npm run validate-services`, `npm run lint`.
- Builder change: Added service `id: 9` with `image: 'neo4j:2026.01.4'`, `port: 7474`, `tunnelEngine: 'cloudflare'`, `pluginSignature: 'CONTAINER_APP_RUNNER'`, `NEO4J_AUTH` input, and persistent `/data` volume; added `neo4j.svg` logo asset.
- Critic challenge: Neo4j commonly uses Bolt (`7687`) for driver connections, so HTTP-only exposure could limit non-browser clients.
- Builder refinement: Kept explicit HTTP-only configuration per user requirement and ensured persistence/auth defaults remain correct for browser-based administration use.
- Outcome: Service catalog now supports deployable Neo4j Community Edition over HTTP with validated schema/lint compliance.
- Follow-up: If driver access is needed later, add a dedicated Bolt-oriented service profile exposing `7687`.

### [UTC 2026-02-11 14:34] [CHANGE] Added Moodle service with DB/bootstrap inputs and persistent storage
- Context: User requested adding Moodle to the service catalog.
- Evidence: `src/data/services.ts`, `public/services/moodle.svg`, `npm run validate-services`, `npm run lint`, `https://raw.githubusercontent.com/bitnami/containers/main/bitnami/moodle/README.md`, `https://registry.hub.docker.com/v2/repositories/bitnamilegacy/moodle/tags?page_size=100`, `https://moodle.com/wp-content/uploads/2024/02/Moodlelogo.svg`.
- Builder change: Added service `id: 10` (`Moodle`) using `bitnamilegacy/moodle:5.0.2-debian-12-r2`, port `8080`, `CONTAINER_APP_RUNNER`, `cloudflare`, Moodle DB/admin inputs, env defaults for MariaDB + reverse proxy, persistent volumes (`/bitnami/moodle`, `/bitnami/moodledata`), and official Moodle logo asset.
- Critic challenge: `bitnamilegacy` images are explicitly deprecated and may be removed, which can break future deployments if the image disappears.
- Builder refinement: Pinned an immutable explicit tag (`5.0.2-debian-12-r2`) instead of floating tags and documented the registry deprecation risk for future migration planning.
- Outcome: Moodle is now deployable as a catalog service with required runtime knobs and passes repo validation/lint gates.
- Follow-up: Migrate to a maintained non-legacy Moodle image profile when a production-grade replacement is confirmed for this platform.

### [UTC 2026-02-12 06:58] [CHANGE] Added Matrix Synapse service with first-boot config bootstrap
- Context: User requested adding Matrix/Synapse as a new deployable service.
- Evidence: `src/data/services.ts`, `public/services/matrix.svg`, `npm run validate-services`, `npm run lint`, `https://hub.docker.com/v2/repositories/matrixdotorg/synapse/`, `https://api.github.com/repos/element-hq/synapse/releases/latest`, `https://raw.githubusercontent.com/element-hq/logos/master/matrix/matrix-logo.svg`.
- Builder change: Added service `id: 11` (`Matrix Synapse`) using `matrixdotorg/synapse:v1.147.0`, port `8008`, required inputs `SYNAPSE_SERVER_NAME` + `SYNAPSE_REPORT_STATS`, persistent `/data` volume, and official Matrix logo; added `CONTAINER_START_COMMAND` to generate `/data/homeserver.yaml` on first boot when absent, then start Synapse.
- Critic challenge: If backend ignores `CONTAINER_START_COMMAND` for `CONTAINER_APP_RUNNER`, Synapse may fail on first boot because modern images require an existing `homeserver.yaml`; also checked that no auth/token/client-server boundary behavior changed because edit is service-catalog only.
- Builder refinement: Kept changes scoped to service metadata, added mandatory bootstrap inputs and explicit `/data` config paths (`SYNAPSE_CONFIG_DIR`, `SYNAPSE_CONFIG_PATH`, `SYNAPSE_HTTP_PORT`) to reduce startup ambiguity, and recorded the backend command-support assumption.
- Outcome: Matrix Synapse is now present in the service catalog and passes repository validation/lint gates.
- Follow-up: Verify runtime behavior on an actual Deeploy node; if `CONTAINER_START_COMMAND` is not honored for container services, add a dedicated bootstrap flow (or documented pre-seeded `homeserver.yaml` requirement).
