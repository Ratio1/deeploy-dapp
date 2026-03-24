# ADR-0001: Deeploy/Ratio1 Stack v1 (Multi-Service Apps)

- Status: Accepted
- Date: 2026-03-24
- Scope: `deeploy-dapp`, `edge_node`, `naeural_core`, `ratio1-sc`

## Context

Deeploy is currently job-centric: a project contains independent jobs, each with independent pricing/payment/lifecycle.

We need first-class support for multi-service applications (for example web/cms/db) while preserving:
- per-component billing and lifecycle as separate jobs,
- current contract and payment primitives where possible,
- existing single-job UX and API compatibility.

## Decision

### 1. Stack model

A **Stack** is a logical grouping of component jobs under one project.

- Stack = grouping + orchestration metadata.
- Stack Component = one deployable service definition.
- Each Stack Component compiles/deploys as one Ratio1 Job.

This keeps current payment/accounting aligned with on-chain job granularity.

### 2. v1 placement

v1 Stack placement mode is explicitly **`co-located`**.

- All components in a stack deployment target the same node.
- Distributed private stack networking is out of scope for v1.

### 3. Internal connectivity

v1 internal service discovery uses the existing semaphore/shared-memory mechanism.

- Provider components publish service connection data under deterministic stack-scoped keys.
- Consumer components wait for required providers and resolve env references from semaphore payloads.

No new overlay network, service mesh, or cross-node private DNS is introduced in v1.

### 4. Public ingress

Public exposure remains optional and per-component.

- Internal-only component: no public tunnel required.
- Public component: existing tunnel/public ingress path remains unchanged.

### 5. Contracts and billing

`ratio1-sc` remains unchanged for v1.

- Existing `createJobs` batch path already supports creating multiple independently billed jobs.
- Shared `projectHash` + off-chain metadata are sufficient for stack grouping/reconciliation in v1.

## Consequences

### Positive

- Backward-compatible with current job model and existing dapp flows.
- Minimal protocol risk for v1.
- Reuses runtime primitives already deployed in production.
- Clear path to richer v2 networking.

### Trade-offs

- v1 stacks are constrained to same-node placements.
- No first-class private cross-node routing.
- Internal discovery is key/value semaphore-based, not DNS-like service naming.

## v2 Deferred Items

- Cross-node private networking/overlay.
- Internal DNS/service aliases across nodes.
- Multi-node HA topologies for stack components.
- Protocol-level stack-native billing primitives.
