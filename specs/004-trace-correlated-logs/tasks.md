# Tasks: Endpoint Logs Correlated With Traces

**Input**: Design documents from /specs/004-trace-correlated-logs/
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Per Zero Testing Policy, no automated tests are created. Manual verification tasks are included.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently.

## Format: [ID] [P?] [Story] Description

- [P]: Task can run in parallel (different files, no blocking dependency)
- [Story]: User story label (US1, US2, US3)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared implementation scaffolding and baseline documentation.

- [x] T001 Align feature docs baseline in specs/004-trace-correlated-logs/plan.md
- [x] T002 Define canonical endpoint log fields in specs/004-trace-correlated-logs/contracts/endpoint-log-event.yaml
- [x] T003 [P] Add implementation notes for manual validation flow in specs/004-trace-correlated-logs/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared logging primitives required by all user stories.

**CRITICAL**: User story tasks start only after this phase.

- [x] T004 Create endpoint log event TypeScript types in app/lib/types.ts
- [x] T005 Implement trace correlation extraction helper in app/lib/tracing.ts
- [x] T006 Implement shared endpoint log emitter utility in app/lib/tracing.ts
- [x] T007 [P] Add safe log serialization guard (no payload/body logging) in app/lib/tracing.ts
- [x] T008 [P] Add structured endpoint log field normalization helper in app/lib/tracing.ts

**Checkpoint**: Shared endpoint logging utilities are ready for route integration.

---

## Phase 3: User Story 1 - Observe Endpoint Logs Per Request (Priority: P1) MVP

**Goal**: Emit one structured endpoint log per API request with trace/span correlation.

**Independent Test**: Run app and call all API routes; confirm exactly one endpoint log event per request with method, route, status, trace_id, and span_id (or correlation_state=missing).

### Implementation for User Story 1

- [x] T009 [US1] Integrate endpoint log emission in app/api/albums/route.ts
- [x] T010 [US1] Integrate endpoint log emission in app/api/albums/[id]/route.ts
- [x] T011 [US1] Integrate endpoint log emission in app/api/photos/[id]/route.ts
- [x] T012 [US1] Integrate endpoint log emission in app/api/health/route.ts
- [x] T013 [P] [US1] Ensure duration_ms is computed and emitted consistently in app/api/albums/route.ts
- [x] T014 [P] [US1] Ensure duration_ms is computed and emitted consistently in app/api/albums/[id]/route.ts
- [x] T015 [P] [US1] Ensure duration_ms is computed and emitted consistently in app/api/photos/[id]/route.ts
- [x] T016 [P] [US1] Ensure duration_ms is computed and emitted consistently in app/api/health/route.ts
- [x] T017 [US1] Run manual verification for US1 scenarios and record outcomes in specs/004-trace-correlated-logs/quickstart.md

**Checkpoint**: US1 is independently functional and verifiable.

---

## Phase 4: User Story 2 - Keep Logs Export-Ready (Priority: P2)

**Goal**: Enforce a stable, schema-aligned endpoint log contract across all routes.

**Independent Test**: Trigger success and failure requests and verify every emitted event follows the same field set, value types, and canonical names from contract.

### Implementation for User Story 2

- [x] T018 [US2] Align emitted event keys with contract in app/lib/tracing.ts
- [x] T019 [P] [US2] Normalize dynamic route patterns in emitted logs in app/api/albums/[id]/route.ts
- [x] T020 [P] [US2] Normalize dynamic route patterns in emitted logs in app/api/photos/[id]/route.ts
- [x] T021 [US2] Set consistent service_name and environment fields in app/lib/tracing.ts
- [x] T022 [US2] Update examples and validation guidance to match final schema in specs/004-trace-correlated-logs/contracts/endpoint-log-event.yaml
- [x] T023 [US2] Run manual schema consistency verification and document checks in specs/004-trace-correlated-logs/quickstart.md

**Checkpoint**: US2 is independently functional and schema-stable.

---

## Phase 5: User Story 3 - Troubleshoot Errors With Correlated Context (Priority: P3)

**Goal**: Ensure failed requests emit correlated error logs with actionable error context.

**Independent Test**: Force error responses and confirm logs include outcome=error, status_code, error_message, and correlation identifiers or missing-context marker.

### Implementation for User Story 3

- [x] T024 [US3] Emit error_message and error outcome in album detail failures in app/api/albums/[id]/route.ts
- [x] T025 [US3] Emit error_message and error outcome in photo detail failures in app/api/photos/[id]/route.ts
- [x] T026 [P] [US3] Emit error_message and error outcome in albums list failures in app/api/albums/route.ts
- [x] T027 [P] [US3] Emit error_message and error outcome in health endpoint failures in app/api/health/route.ts
- [x] T028 [US3] Ensure correlation fallback marker is emitted on missing span context in app/lib/tracing.ts
- [x] T029 [US3] Run manual failure-path verification and record outcomes in specs/004-trace-correlated-logs/quickstart.md

**Checkpoint**: US3 is independently functional and supports correlated error troubleshooting.

---

## Phase 6: Polish and Cross-Cutting Concerns

**Purpose**: Final consistency checks and developer documentation updates.

- [x] T030 [P] Update feature implementation notes in specs/004-trace-correlated-logs/research.md
- [x] T031 [P] Cross-check plan/spec/tasks consistency in specs/004-trace-correlated-logs/plan.md
- [x] T032 Run lint and resolve issues related to modified files via package.json script in package.json
- [x] T033 Execute full quickstart manual walkthrough and capture final sign-off in specs/004-trace-correlated-logs/quickstart.md

---

## Dependencies and Execution Order

### Phase Dependencies

- Setup (Phase 1): Starts immediately
- Foundational (Phase 2): Depends on Setup and blocks all user stories
- User Stories (Phase 3-5): Depend on Foundational completion
- Polish (Phase 6): Depends on all targeted user stories

### User Story Dependencies

- US1 (P1): Starts after Foundational; delivers MVP
- US2 (P2): Starts after Foundational; can follow US1 for easiest validation reuse
- US3 (P3): Starts after Foundational; can run after US1, with shared helpers from Phase 2

### Within Each User Story

- Route integration tasks before manual verification task
- Shared helper updates before route-specific behavior alignment
- Complete each story checkpoint before advancing priority

### Parallel Opportunities

- Phase 1: T003 in parallel with T001-T002
- Phase 2: T007-T008 parallel after T005-T006 foundations are present
- US1: T013-T016 parallel after T009-T012
- US2: T019-T020 parallel after T018
- US3: T026-T027 parallel with each other
- Phase 6: T030-T031 parallel before T033

---

## Parallel Example: User Story 1

- T013 in app/api/albums/route.ts
- T014 in app/api/albums/[id]/route.ts
- T015 in app/api/photos/[id]/route.ts
- T016 in app/api/health/route.ts

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2
2. Complete US1 tasks T009-T017
3. Validate US1 independently before continuing

### Incremental Delivery

1. Ship US1 for immediate observability value
2. Add US2 for schema/export readiness
3. Add US3 for robust failure troubleshooting
4. Finish with Phase 6 consistency and documentation updates

### Team Parallel Strategy

1. One developer handles shared helpers (Phase 2)
2. Route integrations split by endpoint files
3. Documentation/manual verification updates run in parallel at phase boundaries

---

## Notes

- All tasks follow required checklist format.
- No automated tests are included per constitution.
- Manual verification tasks are included for each user story.
