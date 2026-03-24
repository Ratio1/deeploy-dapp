# Deeploy Stacks v1 User Guide

## What Is a Stack?

A **Stack** is a group of related application components under the same Deeploy project.

- Each component is deployed as a separate Ratio1 job.
- Billing remains per component/job.
- Stack metadata is used for grouping, dependency wiring, and co-located placement.

Example stack:
- `web` (public)
- `cms` (internal-only)
- `db` (internal-only)

## Exposure Modes

Each stack component chooses one mode:

- `internal-only`: no public tunnel is required.
- `public`: existing public ingress/tunnel behavior is enabled for that component.

In the example above, only `web` is public.

## Internal References

Component environment variables can reference upstream components:

- `ref(service.host)`
- `ref(service.port)`
- `ref(service.url)`
- `ref(service.container_ip)`

Examples:
- `DATABASE_HOST=ref(db.host)`
- `DATABASE_PORT=ref(db.port)`
- `DATABASE_URL=postgres://user:pass@ref(db.host):ref(db.port)/postgres`

For v1, these refs compile to runtime shared-memory/semaphore discovery values, not public URLs.

## v1 Placement Limitation

Stacks in v1 must use:

- placement mode: `co-located`
- target nodes: exactly one shared target node for all components

Distributed private networking across multiple nodes is deferred to v2.

## Deployment Flow

1. Open a project and create/edit a stack draft.
2. Configure component dependencies and refs.
3. Click `Prepare Deploy` to compile the stack into component draft jobs.
4. Continue through the existing `Payment` flow.
5. Deeploy creates one on-chain job per component in one batch.

## Compatibility

Existing single-job flows are unchanged:

- users can still create standalone job drafts as before,
- existing projects without stacks continue to work unchanged.
