# Implementation Plan: API Metrics Correlated With Traces and Logs

**Branch**: `005-metrics-api` | **Date**: April 15, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-metrics-api/spec.md`

## Summary

Add structured API metric completion events for all current API routes and correlate each event with existing trace and endpoint log context. Metrics are console-first for this phase, with a stable schema aligned for future export workflows in Jaeger, Prometheus, and Grafana.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.1.1, React 19.2.3  
**Primary Dependencies**: Existing OpenTelemetry packages and current tracing/logging utilities  
**Storage**: SQLite (better-sqlite3) for app data only; metric events are not persisted  
**Testing**: N/A (Zero Testing Policy - manual verification only)  
**Target Platform**: Node.js server runtime for Next.js API routes  
**Project Type**: Web (Next.js App Router)  
**Performance Goals**: No visible endpoint latency regression during manual checks  
**Constraints**: Console destination only for this phase, no sensitive payload logging, no new test framework  
**Scale/Scope**: 4 API routes (`/api/health`, `/api/albums`, `/api/albums/[id]`, `/api/photos/[id]`) plus shared metric emission utility

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Initial Check (Before Phase 0)**: PASS

- [x] **Code Quality**: Keep strict TypeScript and current Next.js route conventions
- [x] **Simple UX**: No user-facing behavior changes
- [x] **Responsive Design**: No UI changes
- [x] **Minimal Dependencies**: Reuse existing OpenTelemetry stack and app utilities
- [x] **Zero Testing**: Manual verification only

**Post-Design Check (After Phase 1)**: PASS

- [x] **Code Quality**: Design centralizes metric schema logic in shared utility code
- [x] **Simple UX**: Scope remains backend observability instrumentation only
- [x] **Responsive Design**: Not applicable to backend-only change, no UI impact
- [x] **Minimal Dependencies**: Design avoids additional packages
- [x] **Zero Testing**: Quickstart defines manual verification flow only

## Project Structure

### Documentation (this feature)

```text
specs/005-metrics-api/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-metric-event.yaml
└── tasks.md            # Created later by /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── albums/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── photos/
│   │   └── [id]/route.ts
│   └── health/
│       └── route.ts
├── lib/
│   ├── tracing.ts
│   └── types.ts
└── ...

instrumentation.ts
package.json
```

**Structure Decision**: Keep route-local request lifecycle handling and add shared metric event helpers in `app/lib/tracing.ts` (and types in `app/lib/types.ts` if needed) to ensure one canonical metric schema across all handlers.

## Complexity Tracking

No constitution violations expected. Complexity remains low by extending existing trace/log correlation utilities rather than introducing a new telemetry subsystem.

## Planning Complete

**Status**: Phase 1 baseline aligned

## Phase 1 Baseline Alignment

- Baseline implementation references are synchronized to the active route scope (`/api/health`, `/api/albums`, `/api/albums/[id]`, `/api/photos/[id]`).
- Canonical required fields remain fixed as: `timestamp`, `event_name`, `service_name`, `environment`, `method`, `route`, `status_code`, `status_class`, `outcome`, `duration_ms`, and `correlation_state`.
- Canonical optional fields remain fixed as: `trace_id`, `span_id`, `request_id`, and `error_message`.
- Validation guidance is implementation-oriented and captured in `quickstart.md` so route integration and manual verification can run from one checklist.

### Phase 0: Research
- `research.md` defines correlation, schema, and resilience decisions for API metric completion events

### Phase 1: Design and Contracts
- `data-model.md` defines metric entities and validation rules
- `contracts/api-metric-event.yaml` defines canonical field names and constraints
- `quickstart.md` defines manual verification steps and acceptance checks

### Phase 2: Tasks
- Run `/speckit.tasks` to generate implementation tasks in `tasks.md`

### Next Command

`/speckit.implement phase 2`

## Phase 6 Consistency Cross-Check

**Status**: Complete (April 17, 2026)

Cross-check result across `spec.md`, `plan.md`, and `tasks.md`:

- Scope consistency: all four in-scope routes from `spec.md` are implemented and manually verified.
- Contract consistency: required and optional metric fields in implementation and docs match the canonical contract and examples.
- Behavior consistency: one completion metric event per handled request path, including error responses.
- Correlation consistency: `trace_id`/`span_id`/`request_id` nullable behavior and `correlation_state` fallback align with requirements.
- Environment consistency: default environment label is verified as `local` for local runs.
- Task consistency: all task phases (T001-T035) map to implemented artifacts and recorded verification outcomes.

Final verification artifacts and sign-off details are captured in `quickstart.md`.
