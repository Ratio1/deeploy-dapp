# TODO: Multi-Plugin Semaphore Dependencies

## Context

The backend currently supports semaphore-based startup ordering between plugins, but only for exactly 2 plugins (1 native + 1 container). For multi-container deployments like MISP (native orchestrator + Redis + MariaDB + MISP Core), there's no way to express "MISP Core must wait for Redis and MariaDB to be ready."

This feature adds explicit user-controlled dependency wiring via a new `shmem` dynamic env type, a dependency tree visualization with circular-dependency prevention, and extends the backend to wire SEMAPHORE/SEMAPHORED_KEYS for N plugins.

## Data Flow

```
UI: user selects shmem type → picks plugin + env key (HOST/PORT/URL/CONTAINER_IP)
      ↓
Payload: plugin_name on each plugin, shmem path as [pluginName, envKey], dependency_tree
      ↓
Backend: generates INSTANCE_IDs → builds name→instanceId map
         → replaces plugin names in DYNAMIC_ENV shmem paths with semaphore keys
         → sets SEMAPHORE on providers, SEMAPHORED_KEYS on consumers
      ↓
Runtime: provider CAR publishes HOST/PORT/URL/CONTAINER_IP via semaphore
         → consumer CAR waits until all semaphored keys are ready → starts container
```

---

## Part 1: UI Changes (deeploy-dapp)

### 1.1 Add `shmem` to dynamic env types

**File:** `src/data/dynamicEnvTypes.ts`

```ts
export const DYNAMIC_ENV_TYPES = ['static', 'host_ip', 'shmem'] as const;
```

### 1.2 Add shmem env keys constant

**New file:** `src/data/shmemEnvKeys.ts`

```ts
export const SHMEM_ENV_KEYS = ['HOST', 'PORT', 'URL', 'CONTAINER_IP'] as const;
```

These are the keys published by `_setup_semaphore_env()` in `container_app_runner.py:2595`.

### 1.3 Update DynamicEnvVarValue type

**File:** `src/typedefs/steps/deploymentStepTypes.ts`

Add optional `path` field for shmem:

```ts
type DynamicEnvVarValue = { type: string; value: string; path?: [string, string] };
```

`path` is `[pluginName, envKey]` — only populated when `type === 'shmem'`.

### 1.4 Update dynamicEnvPairSchema

**File:** `src/schemas/common.ts`

Add `path` to the schema object and a refinement for shmem:

```ts
export const dynamicEnvPairSchema = z
    .object({
        type: z.enum(DYNAMIC_ENV_TYPES),
        value: z.string().max(128, '...').regex(...).optional(),
        path: z.tuple([z.string(), z.string()]).optional(),
    })
    .refine(
        (data) => {
            if (data.type === 'shmem') {
                return Array.isArray(data.path) && data.path.length === 2
                    && data.path[0].length > 0 && data.path[1].length > 0;
            }
            return true;
        },
        { message: 'Plugin and env key required for shmem type', path: ['path'] },
    );
```

### 1.5 Create plugin name utility

**New file:** `src/lib/pluginNames.ts`

Extract naming logic from `PluginsSection.tsx:141-157` into a reusable function:

```ts
export function getPluginName(plugin: Plugin, index: number): string { ... }
export function isContainerizedPlugin(plugin: Plugin): boolean { ... }
```

Update `PluginsSection.tsx` `getPluginAlias` to call `getPluginName()` instead of duplicating the logic.

### 1.6 Update DynamicEnvSection for shmem UI

**File:** `src/shared/jobs/DynamicEnvSection.tsx`

**New prop:** `availablePlugins?: { name: string }[]` — other CAR/WAR plugins in the pipeline.

**When type === 'shmem':** Replace the text input (w-2/3 area) with two dropdowns side by side:
- Left (w-1/2): Plugin dropdown → `Controller` for `...values.${k}.path.0`, items from `availablePlugins`
- Right (w-1/2): Env key dropdown → `Controller` for `...values.${k}.path.1`, items from `SHMEM_ENV_KEYS`

**When type changes:** Reset `path`/`value` appropriately in `onSelectionChange`:
- Switching TO shmem → clear `value`, set `path: ['', '']`
- Switching FROM shmem → clear `path`

### 1.7 Thread availablePlugins through component chain

The prop flows: `PluginsSection` → `CARInputsSection` / `WARInputsSection` → `GenericPluginSections` → `DynamicEnvSection`.

**Files to modify:**
- `src/components/create-job/plugins/PluginsSection.tsx` — compute `availablePlugins` per-plugin (all other CAR/WAR plugins) using `useWatch` on `plugins`, pass to input sections
- `src/components/create-job/plugins/CARInputsSection.tsx` — accept and forward `availablePlugins`
- `src/components/create-job/plugins/WARInputsSection.tsx` — accept and forward `availablePlugins`
- `src/components/create-job/plugins/GenericPluginSections.tsx` — accept and forward `availablePlugins`

### 1.8 Create dependency tree computation

**New file:** `src/lib/dependencyTree.ts`

```ts
export type DependencyEdge = { from: string; to: string };

export function computeDependencyTree(plugins: Plugin[]): {
    edges: DependencyEdge[];
    hasCycle: boolean;
}
```

Scans all plugins' `dynamicEnvVars` for `type === 'shmem'` entries, extracts `path[0]` as the provider plugin name, deduplicates edges, runs DFS cycle detection.

### 1.9 Dependency tree visualization

**New file:** `src/components/create-job/plugins/DependencyTreeView.tsx`

Simple list with arrows, only rendered when edges exist. Shows cycle warning in red when detected.

```
Plugin Dependencies
  container-app-runner-3 → container-app-runner-1
  container-app-runner-3 → container-app-runner-2
```

Integrated at the bottom of `PluginsSection.tsx` after the plugins map block.

### 1.10 Circular dependency validation in schema

**File:** `src/schemas/steps/deployment.ts`

Add `.superRefine()` to `nativeAppPluginsSchema` that calls `computeDependencyTree()` and issues an error if `hasCycle` is true.

### 1.11 Update payload formatting

**File:** `src/lib/deeploy-utils.ts`

**`formatDynamicEnvVars()`** — for shmem entries, emit `{ type: 'shmem', path: [pluginName, envKey] }` instead of `{ type, value }`.

**`formatNativeJobPayload()`** — two changes:
1. Add `plugin_name: getPluginName(plugin, index)` to each plugin object in the `plugins.map` callback
2. Compute `dependency_tree` from `computeDependencyTree()` and add to return object as `dependency_tree: edges.map(e => [e.from, e.to])`

### 1.12 Handle plugin removal — clean stale shmem references

**File:** `src/components/create-job/plugins/PluginsSection.tsx`

When a plugin is removed (`remove(index)`), iterate all remaining plugins' `dynamicEnvVars` and clear any shmem entries whose `path[0]` references a plugin name that no longer exists (since names are index-based, they all shift). Use `setValue` to update affected entries.

---

## Part 2: Backend Changes (edge_node)

### 2.1 Add constants

**File:** `extensions/business/deeploy/deeploy_const.py`

Add to `DEEPLOY_KEYS`:
```python
PLUGIN_NAME = "plugin_name"
DEPENDENCY_TREE = "dependency_tree"
```

### 2.2 Update deeploy_prepare_plugins to return name mapping

**File:** `extensions/business/deeploy/deeploy_mixin.py` — `deeploy_prepare_plugins()` (~line 1691)

Changes:
1. Extract and preserve `plugin_name` from each plugin instance (exclude it from instance_config like plugin_signature)
2. Build `name_to_instance: dict[str, dict]` mapping `plugin_name → { instance_id, signature }`
3. Return `(prepared_plugins, name_to_instance)` tuple instead of just `prepared_plugins`
4. Update all callers to destructure the tuple

### 2.3 New method: _resolve_shmem_references

**File:** `extensions/business/deeploy/deeploy_mixin.py`

```python
def _resolve_shmem_references(self, plugins, name_to_instance, app_id):
```

Steps:
1. Build `name → semaphore_key` map: `sanitize_name(f"{app_id}__{instance_id}")`
2. Scan all instances' `DYNAMIC_ENV` for `type: 'shmem'` entries
3. Replace `path[0]` (plugin name) with the resolved semaphore key
4. Track providers (referenced plugins) and consumers (referencing plugins)
5. Set `SEMAPHORE` on each provider instance
6. Set `SEMAPHORED_KEYS` on each consumer instance (list of all semaphore keys it depends on)

### 2.4 Extend _autowire_native_container_semaphore for N plugins

**File:** `extensions/business/deeploy/deeploy_mixin.py` (~line 1476)

Changes:
1. Remove the `len(plugins) != 2` gate — replace with `len(plugins) < 2`
2. Add early exit if explicit shmem references detected (new `_has_shmem_dynamic_env()` helper)
3. Generalize to find ALL native plugins and ALL containerized plugins
4. Set SEMAPHORE on all native instances, SEMAPHORED_KEYS on all container instances (all native semaphore keys)

This preserves backward compatibility: existing 2-plugin deployments work identically, and N-plugin deployments without explicit shmem still get native→container autowiring.

### 2.5 Wire into pipeline creation flow

**File:** `extensions/business/deeploy/deeploy_mixin.py`

In both create and update flows (around lines 130-160 and 375), after `deeploy_prepare_plugins`:

```python
plugins, name_to_instance = self.deeploy_prepare_plugins(inputs)
if name_to_instance:
    plugins = self._resolve_shmem_references(plugins, name_to_instance, app_id)
plugins = self._autowire_native_container_semaphore(app_id, plugins, job_app_type)
```

Order matters: explicit shmem resolution runs first, then autowiring checks if shmem was already set and skips if so.

### 2.6 Validate dependency_tree

**File:** `extensions/business/deeploy/deeploy_mixin.py`

Before deploying, if `dependency_tree` is present in inputs:
- Validate it's a list of `[from, to]` pairs
- Run DFS cycle detection
- Raise `ValueError` if circular dependency found

---

## Critical Files Summary

| File | Repo | Change |
|------|------|--------|
| `src/data/dynamicEnvTypes.ts` | dapp | Add `'shmem'` |
| `src/data/shmemEnvKeys.ts` | dapp | **New** — shmem env key constants |
| `src/lib/pluginNames.ts` | dapp | **New** — `getPluginName()`, `isContainerizedPlugin()` |
| `src/lib/dependencyTree.ts` | dapp | **New** — `computeDependencyTree()` with cycle detection |
| `src/typedefs/steps/deploymentStepTypes.ts` | dapp | Add `path?` to `DynamicEnvVarValue` |
| `src/schemas/common.ts` | dapp | Add `path` + shmem refinement to `dynamicEnvPairSchema` |
| `src/schemas/steps/deployment.ts` | dapp | Add cycle detection superRefine to `nativeAppPluginsSchema` |
| `src/shared/jobs/DynamicEnvSection.tsx` | dapp | shmem two-dropdown UI, `availablePlugins` prop |
| `src/components/create-job/plugins/PluginsSection.tsx` | dapp | Compute/pass `availablePlugins`, integrate dep tree, handle plugin removal cleanup |
| `src/components/create-job/plugins/GenericPluginSections.tsx` | dapp | Forward `availablePlugins` |
| `src/components/create-job/plugins/CARInputsSection.tsx` | dapp | Forward `availablePlugins` |
| `src/components/create-job/plugins/WARInputsSection.tsx` | dapp | Forward `availablePlugins` |
| `src/components/create-job/plugins/DependencyTreeView.tsx` | dapp | **New** — dependency tree visualization |
| `src/lib/deeploy-utils.ts` | dapp | `formatDynamicEnvVars` shmem handling, `formatNativeJobPayload` plugin names + dep tree |
| `extensions/business/deeploy/deeploy_const.py` | edge | Add `PLUGIN_NAME`, `DEPENDENCY_TREE` keys |
| `extensions/business/deeploy/deeploy_mixin.py` | edge | `deeploy_prepare_plugins` returns name map, new `_resolve_shmem_references`, extend `_autowire_native_container_semaphore` for N plugins, dep tree validation |

## Edge Cases

1. **Plugin removal shifts names** — When plugin at index 1 is removed, "container-app-runner-3" becomes "container-app-runner-2". Must clean stale shmem refs in remaining plugins' dynamicEnvVars.
2. **Self-reference** — Prevented by excluding current plugin from `availablePlugins` dropdown.
3. **Mixed explicit + auto wiring** — Explicit shmem takes precedence; autowiring skips when shmem detected.
4. **No shmem in payload** — Old payloads without `plugin_name` work unchanged (empty name map → skip shmem resolution → autowiring proceeds as before).
5. **Consumer waits forever if provider crashes** — Existing limitation, not addressed here (no timeout mechanism exists currently).

## Verification

1. Create a native job with 3 container plugins (e.g., Redis, MariaDB, MISP Core)
2. On MISP Core, add dynamic env vars with shmem type pointing to Redis (HOST) and MariaDB (HOST)
3. Verify dependency tree shows at the bottom: `container-app-runner-3 → container-app-runner-1, container-app-runner-2`
4. Verify circular dependency: add shmem on Redis pointing to MISP Core → form shows cycle error, cannot submit
5. Download the config JSON → verify `plugin_name` and `dependency_tree` in payload
6. Deploy and verify backend logs show SEMAPHORE set on Redis/MariaDB, SEMAPHORED_KEYS on MISP Core
7. Verify MISP Core container waits until Redis and MariaDB are healthy before starting
8. Test backward compat: deploy a simple 2-plugin native+container job → verify autowiring still works