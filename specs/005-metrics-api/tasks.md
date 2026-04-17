# Tasks: API Metrics Correlated With Traces and Logs

**Input**: Design documents from /specs/005-metrics-api/  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Per Zero Testing Policy, no automated tests are created. Manual verification tasks are included.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently.

## Format: [ID] [P?] [Story] Description

- [P]: Task can run in parallel (different files, no blocking dependency)
- [Story]: User story label (US1, US2, US3)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare and align feature docs and implementation notes.

- [x] T001 Align feature baseline documentation in specs/005-metrics-api/plan.md
- [x] T002 Confirm canonical metric fields and examples in specs/005-metrics-api/contracts/api-metric-event.yaml
- [x] T003 [P] Add implementation-oriented validation notes in specs/005-metrics-api/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared metric primitives required by all user stories.

**CRITICAL**: User story work starts only after this phase.

- [x] T004 Create API metric event TypeScript types in app/lib/types.ts
- [x] T005 Implement status class resolver (`1xx`..`5xx`) in app/lib/tracing.ts
- [x] T006 Implement shared API metric emitter utility in app/lib/tracing.ts
- [x] T007 Implement correlation extraction for `trace_id`, `span_id`, and `request_id` in app/lib/tracing.ts
- [x] T008 [P] Implement non-blocking emission guard in app/lib/tracing.ts
- [x] T009 [P] Implement safe serialization rules (forbidden field filtering) in app/lib/tracing.ts
- [x] T010 [P] Implement environment resolver with default `local` in app/lib/tracing.ts

**Checkpoint**: Shared metric emission utilities are ready for route integration.

---

## Phase 3: User Story 1 - Observe API Metrics Per Request (Priority: P1) MVP

**Goal**: Emit one structured metric completion event per handled API request.

**Independent Test**: Run app and call all in-scope routes; confirm exactly one `api.request.metric.completed` event per request with method, route, status_code, duration_ms, and outcome.

### Implementation for User Story 1

- [x] T011 [US1] Integrate metric emission in app/api/health/route.ts
- [x] T012 [US1] Integrate metric emission in app/api/albums/route.ts
- [x] T013 [US1] Integrate metric emission in app/api/albums/[id]/route.ts
- [x] T014 [US1] Integrate metric emission in app/api/photos/[id]/route.ts
- [x] T015 [P] [US1] Ensure `duration_ms` computation is consistent in app/api/health/route.ts
- [x] T016 [P] [US1] Ensure `duration_ms` computation is consistent in app/api/albums/route.ts
- [x] T017 [P] [US1] Ensure `duration_ms` computation is consistent in app/api/albums/[id]/route.ts
- [x] T018 [P] [US1] Ensure `duration_ms` computation is consistent in app/api/photos/[id]/route.ts
- [x] T019 [US1] Run manual verification for US1 scenarios and record outcomes in specs/005-metrics-api/quickstart.md

**Checkpoint**: US1 is independently functional and verifiable.

---

## Phase 4: User Story 2 - Correlate Metrics With Traces and Logs (Priority: P2)

**Goal**: Ensure metric events carry correlation context that maps to trace and log signals.

**Independent Test**: Trigger requests and verify each metric event contains correlation identifiers (`trace_id`, `span_id`, `request_id`) when available, or `correlation_state=missing` when unavailable.

### Implementation for User Story 2

- [x] T020 [US2] Attach `trace_id`, `span_id`, and `request_id` in shared emission utility in app/lib/tracing.ts
- [x] T021 [P] [US2] Normalize dynamic route pattern in metrics for albums detail in app/api/albums/[id]/route.ts
- [x] T022 [P] [US2] Normalize dynamic route pattern in metrics for photos detail in app/api/photos/[id]/route.ts
- [x] T023 [US2] Add correlation fallback marker behavior in app/lib/tracing.ts
- [x] T024 [US2] Run manual correlation verification and document checks in specs/005-metrics-api/quickstart.md

**Checkpoint**: US2 is independently functional with robust correlation behavior.

---

## Phase 5: User Story 3 - Keep Metrics Export-Ready for Jaeger, Prometheus, and Grafana (Priority: P3)

**Goal**: Maintain stable, tool-friendly metric schema and naming for future exporter wiring.

**Independent Test**: Validate key set, value types, enum domains, and route normalization consistency across success and failure paths.

### Implementation for User Story 3

- [x] T025 [US3] Align emitted event keys with contract in app/lib/tracing.ts
- [x] T026 [P] [US3] Add `status_class` derivation and validation in app/lib/tracing.ts
- [x] T027 [P] [US3] Enforce `event_name=api.request.metric.completed` in app/lib/tracing.ts
- [x] T028 [US3] Ensure optional `error_message` appears only for error outcomes in route handlers
- [x] T029 [US3] Enforce environment default resolver (`environment=local` when unset) in app/lib/tracing.ts
- [x] T030 [US3] Finalize contract examples and constraints in specs/005-metrics-api/contracts/api-metric-event.yaml
- [x] T031 [US3] Run manual schema consistency verification and record results in specs/005-metrics-api/quickstart.md

**Checkpoint**: US3 is independently functional and export-ready at schema level.

---

## Phase 6: Polish and Cross-Cutting Concerns

**Purpose**: Final consistency checks and documentation sign-off.

- [x] T032 [P] Update final implementation notes in specs/005-metrics-api/research.md
- [x] T033 [P] Cross-check plan/spec/tasks consistency in specs/005-metrics-api/plan.md
- [x] T034 Run lint and resolve issues related to modified files using package.json scripts
- [x] T035 Execute complete quickstart walkthrough and capture final sign-off in specs/005-metrics-api/quickstart.md

---

## Dependencies and Execution Order

### Phase Dependencies

- Setup (Phase 1): Starts immediately
- Foundational (Phase 2): Depends on Setup and blocks all user stories
- User Stories (Phase 3-5): Depend on Foundational completion
- Polish (Phase 6): Depends on all targeted user stories

### User Story Dependencies

- US1 (P1): Starts after Foundational; delivers MVP
- US2 (P2): Starts after Foundational; easiest after US1 route wiring
- US3 (P3): Starts after Foundational; easiest after US1 and US2 validation baselines

### Within Each User Story

- Route integration tasks before manual verification task
- Shared utility changes before endpoint-specific consistency checks
- Complete each story checkpoint before advancing priority

### Parallel Opportunities

- Phase 1: T003 parallel with T001-T002
- Phase 2: T008-T010 parallel after T005-T007 foundations
- US1: T015-T018 parallel after T011-T014
- US2: T021-T022 parallel after T020
- US3: T026-T027 parallel after T025
- Phase 6: T032-T033 parallel before T035

---

## Parallel Example: User Story 1

- T015 in app/api/health/route.ts
- T016 in app/api/albums/route.ts
- T017 in app/api/albums/[id]/route.ts
- T018 in app/api/photos/[id]/route.ts

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2
2. Complete US1 tasks T011-T019
3. Validate US1 independently before continuing

### Incremental Delivery

1. Ship US1 for immediate console metric visibility
2. Add US2 for cross-signal trace/log correlation
3. Add US3 for schema stability and exporter readiness
4. Finish with Phase 6 consistency and sign-off

### Team Parallel Strategy

1. One developer handles shared utility and schema tasks in app/lib/tracing.ts
2. Route integrations split across endpoint files
3. Documentation/manual verification updates run in parallel at phase boundaries

---

## Notes

- All tasks follow required checklist format.
- No automated tests are included per constitution.
- Manual verification tasks are included for each user story.
