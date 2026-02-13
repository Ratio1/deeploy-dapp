---
name: add-service
description: Add new entries to Deeploy services by collecting all mandatory details, researching the right image/env inputs, updating service fields correctly, and validating the result.
metadata:
    short-description: Add a new Deeploy service safely.
---

## Purpose

Use this skill when the user asks to add a new Service (or update an existing one) in this repository.

## Load Context First (Progressive)

Read this minimal set first:

- `src/data/services.ts`
- `scripts/add-service.ts`
- `scripts/validate-services.ts`

Then load additional files only if needed:

- `src/data/SERVICES.md`: only when examples/recommendations are needed.
- `src/shared/SmallTag.tsx`: only when `color` is missing/invalid/uncertain.
- `src/data/dynamicEnvTypes.ts`: only when using `dynamicEnvVars`.
- `src/lib/deeploy-utils.ts`: only when using advanced fields or checking payload behavior (`dynamicEnvVars`, `pipelineParams`, `pluginParams`, `buildAndRunCommands`, tunneling token keys).

Use targeted search (`rg`) and read narrow snippets instead of full files whenever possible. Do not reload unchanged files unless uncertainty remains.

## Canonical Service Shape

From `src/data/services.ts`, a Service supports:

- Mandatory: `id`, `name`, `description`, `image`, `port`, `inputs`, `logo`, `color`, `pluginSignature`, `tunnelEngine`
- Optional: `envVars`, `dynamicEnvVars`, `volumes`, `fileVolumes`, `buildAndRunCommands`, `pipelineParams`, `pluginParams`

Important constraints currently enforced by scripts/code:

- `description` must be `<= 100` chars.
- `port` must be numeric and valid for network usage.
- `logo` extension must be `.svg` or `.png`.
- `logo` file must exist in `public/services`.
- `color` must be one of the `ColorVariant` values in `src/shared/SmallTag.tsx`.
- `pluginSignature` must be `CONTAINER_APP_RUNNER` or `WORKER_APP_RUNNER`.
- `tunnelEngine` must be `cloudflare` or `ngrok`.
- `dynamicEnvVars` entries must use exactly 3 typed values each.

Plugin-signature behavior:

- `CONTAINER_APP_RUNNER`: requires a Docker image that is ready to run directly.
- `WORKER_APP_RUNNER`: can be used when there is no prebuilt app image and setup must happen at runtime from source; in this mode `buildAndRunCommands` is required.
- In the current repo schema, `image` is still a required Service field even for `WORKER_APP_RUNNER`, so provide a runtime/base image and pair it with `buildAndRunCommands`.
- For `WORKER_APP_RUNNER` services, treat `pluginParams.VCS_DATA` as mandatory:
  - `VCS_DATA.REPO_URL` is required.
  - `VCS_DATA.USERNAME` and `VCS_DATA.TOKEN` are required when repository access is private.

## Research-First Workflow (Mandatory)

When the request is like "add new X service", do this order:

1. Research official sources first and build a draft configuration yourself.
2. Present the inferred configuration to the user with sources used.
3. Ask confirmation questions only for missing, ambiguous, or low-confidence fields.
4. Edit files only after the user confirms unresolved details.

Do not start by asking the user every field if the service can be reliably inferred.

## Mandatory Confirmation Questions

After proposing the draft, ask for confirmation/inputs for unresolved required fields:

1. Service display name.
2. Short description (max 100 chars).
3. Docker image including tag (avoid ambiguous `latest` unless user explicitly asks for it).
4. Exposed container port.
5. Plugin signature (`CONTAINER_APP_RUNNER` or `WORKER_APP_RUNNER`).
6. Tunnel engine (`cloudflare` or `ngrok`).
7. Tag color variant.
8. Logo filename (`.svg` or `.png`) and whether the logo file exists in `public/services`.

Also confirm these optional groups (only ask when relevant to the chosen service):

1. Required user-provided inputs (`inputs`) with key, label, description, placeholder, default value.
2. Static env vars (`envVars`).
3. Dynamic env vars (`dynamicEnvVars`, each with exactly 3 values).
4. Persistent volumes (`volumes`) and file volumes (`fileVolumes`).
5. Build/start commands (`buildAndRunCommands`).
6. Pipeline parameters JSON (`pipelineParams`).
7. Root plugin params JSON (`pluginParams`).

If any mandatory field is still uncertain, stop and ask targeted follow-up questions before editing.

Conditional mandatory rule:

- If `pluginSignature` is `WORKER_APP_RUNNER` and there is no prebuilt runnable app image, `buildAndRunCommands` is mandatory and must be explicitly confirmed.
- If `pluginSignature` is `WORKER_APP_RUNNER`, `pluginParams.VCS_DATA.REPO_URL` is mandatory and must be explicitly confirmed.
- If the repository is private, `pluginParams.VCS_DATA.USERNAME` and `pluginParams.VCS_DATA.TOKEN` are mandatory and must be explicitly confirmed.

## How To Infer Configuration Reliably

Use official documentation as primary sources (in priority order):

1. Official product docs.
2. Official Docker image documentation (publisher-maintained).
3. Official source repository docs (`README`, deployment docs).

Infer and prefill at least:

- image + pinned/stable tag
- default exposed port
- required setup env vars and credentials
- persistent data directories for volumes
- entrypoint/build commands if worker-style setup is required
- likely tunnel choice (`cloudflare` for HTTP(S), `ngrok` for non-HTTP/TCP use)

Rules:

1. Prefer official/maintained images and namespaces.
2. Prefer stable explicit tags; never silently choose `latest`.
3. Map secret/user-provided values into `inputs`.
4. Map fixed defaults into `envVars`.
5. Add durable storage paths into `volumes` for stateful apps.
6. If two or more valid configs exist, present options and ask the user to choose.
7. If choosing `WORKER_APP_RUNNER` for a source-based setup, always infer and propose `buildAndRunCommands` and verify they are sufficient to produce runnable artifacts (maybe by running a local container to test, if applicable).
8. If choosing `WORKER_APP_RUNNER`, always infer and propose `VCS_DATA` with at least `REPO_URL`; include `USERNAME` and `TOKEN` when private repository access is needed.

Reliability gate:

- If information is not 100% reliable (conflicting docs, unclear env requirements, unclear port/storage), explicitly say what is uncertain and ask focused questions before editing.

## Edit Workflow

1. Ensure the logo file is present in `public/services/<logo-filename>`.
2. If no suitable logo exists locally, try to download an SVG from reliable sources in this order:

- official product/brand assets page
- official GitHub repository assets
- trusted public logo repositories (for example Simple Icons) when official assets are unavailable

3. Prefer SVG over PNG, use a clearly named filename, and verify the file renders correctly.
4. If a reliable logo source cannot be found with high confidence, stop and ask the user for the logo file or preferred source.
5. Add/update the service object in `src/data/services.ts`.
6. Set `id` to the next available integer (`max existing id + 1`) for new services.
7. Keep formatting consistent with repository style.
8. Include optional fields only when needed, but do not omit critical runtime fields (for example persistent `volumes` for stateful services).
9. If using `npm run add-service`, review output and manually patch missing fields (notably `volumes` / `fileVolumes`) when required.

## Validation Before Finishing

Run and check:

- `npm run validate-services`
- `npm run lint` (if TypeScript files changed)

If validation fails, fix issues before returning final output.

## Response Contract

In the final response:

- List what was added/changed.
- Confirm validation results.
- List the sources used to infer the configuration and what each source confirmed.
- Call out assumptions made.
- If anything remains uncertain, ask focused follow-up questions.
