# Implementation Plan: Endpoint Logs Correlated With Traces

**Branch**: `004-trace-correlated-logs` | **Date**: April 7, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-trace-correlated-logs/spec.md`

## Summary

Add structured endpoint log events to all API routes and correlate each event with the active trace/span context. Logs remain console-first for study workflows, while enforcing a stable schema that is ready for future external export pipelines.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.1.1, React 19.2.3  
**Primary Dependencies**: Existing OpenTelemetry packages in package.json, Next.js runtime APIs  
**Storage**: SQLite (better-sqlite3) for app data only; endpoint logs are not persisted  
**Testing**: N/A (Zero Testing Policy - manual verification only)  
**Target Platform**: Node.js server runtime for Next.js API routes on local development environments  
**Project Type**: Web (Next.js App Router)  
**Performance Goals**: Log emission should not introduce visible endpoint latency regression during manual verification  
**Constraints**: Console destination only for this phase, no sensitive payload logging, no new test framework  
**Scale/Scope**: 4 API routes (`/api/albums`, `/api/albums/[id]`, `/api/photos/[id]`, `/api/health`) plus shared logging utility

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Initial Check (Before Phase 0)**: PASS

- [x] **Code Quality**: Keep strict TypeScript and current Next.js conventions in route handlers and shared lib utilities
- [x] **Simple UX**: No user-facing interaction changes; backend observability only
- [x] **Responsive Design**: No UI layout changes; existing responsive behavior unaffected
- [x] **Minimal Dependencies**: Reuse installed OpenTelemetry stack; no new packages required
- [x] **Zero Testing**: Manual verification only; no test artifacts introduced

**Post-Design Check (After Phase 1)**: PASS

- [x] **Code Quality**: Design uses one shared endpoint logging utility and consistent route integration pattern
- [x] **Simple UX**: Scope remains implementation-only for observability signals
- [x] **Responsive Design**: Not applicable to this backend-only feature, no UI regressions introduced by design
- [x] **Minimal Dependencies**: Design explicitly avoids additional dependencies
- [x] **Zero Testing**: Quickstart uses manual verification scripts and browser/API checks only

## Project Structure

### Documentation (this feature)

```text
specs/004-trace-correlated-logs/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── endpoint-log-event.yaml
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
│   └── db.ts
└── ...

instrumentation.ts
package.json
```

**Structure Decision**: Keep route-local span lifecycle code and introduce a shared logger helper in `app/lib` to centralize endpoint log schema and correlation extraction.

## Complexity Tracking

No constitution violations expected. Complexity remains low by reusing existing instrumentation and adding a single shared logging abstraction.

## Planning Complete

**Status**: Ready for task breakdown

## Phase 1 Setup Baseline

Phase 1 setup artifacts are aligned to unblock implementation:

- `plan.md` defines shared scope and route coverage for correlated endpoint logging
- `contracts/endpoint-log-event.yaml` defines canonical field names, required vs optional fields, and field-level constraints
- `quickstart.md` includes manual validation flow notes to verify one event per request, schema consistency, and failure-path correlation

Baseline implementation assumptions:

- Console output remains the only log sink for this feature phase
- Event payload/body content is excluded from endpoint logs
- Dynamic routes are logged as normalized patterns (for example `/api/albums/[id]`)
- Missing trace/span context is represented using `correlation_state=missing`

### Phase 0: Research
- `research.md` defines schema, correlation, and error-handling decisions

### Phase 1: Design and Contracts
- `data-model.md` defines endpoint log event entities and validation rules
- `contracts/endpoint-log-event.yaml` defines the structured event contract
- `quickstart.md` defines manual validation steps
- Agent context update script executed

### Phase 2: Tasks
- Run `/speckit.tasks` to generate implementation tasks in `tasks.md`

### Next Command

`/speckit.tasks`

## Phase 6 Consistency Cross-Check

Cross-check completed between `spec.md`, `plan.md`, and `tasks.md`.

### Scope Consistency

- Planned route scope matches implemented task scope: `/api/albums`, `/api/albums/[id]`, `/api/photos/[id]`, `/api/health`.
- Shared utility scope in `app/lib/tracing.ts` matches foundational task breakdown (T005-T008).
- Manual-verification-only approach remains consistent with constitution and task design.

### Requirement Coverage Mapping

- FR-001 through FR-006: covered by route integrations and endpoint completion event emission.
- FR-007 through FR-008: covered by canonical schema alignment and normalization tasks.
- FR-009: covered by failure-path emission and error-message checks.
- FR-010: maintained by non-blocking logging pattern in endpoint handlers.
- FR-011: covered by safe serialization guard and forbidden-field policy.
- FR-012: covered by quickstart workflows and recorded manual outcomes.

### Success Criteria Alignment

- SC-001 and SC-002 validated in US1/US2 manual runs.
- SC-003 supported by trace/span correlation fields and structured event shape.
- SC-004 validated through schema consistency checks (zero drift indicators).
- SC-005 validated via manual walkthroughs with endpoint behavior intact while logging is enabled.
