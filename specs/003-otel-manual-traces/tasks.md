# Tasks: Manual OpenTelemetry Trace Instrumentation

**Input**: Design documents from `/specs/003-otel-manual-traces/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Per the Zero Testing Policy and explicit user requirement, NO automated tests will be created. Manual verification in browser/console is required instead.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/`, `app/lib/`, `instrumentation.ts` at repository root
- Paths shown below use actual project structure from plan.md
- **NO tests/ directory** - Zero Testing Policy (manual verification only)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tracing infrastructure setup

- [X] T001 Verify existing @opentelemetry/sdk-node dependency is installed (package.json)
- [X] T002 [P] Create app/lib/tracing.ts utility module for tracing setup
- [X] T003 [P] Review OpenTelemetry semantic conventions documentation for HTTP attributes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core tracing infrastructure that MUST be complete before ANY endpoint instrumentation

**⚠️ CRITICAL**: No endpoint instrumentation can begin until this phase is complete

- [X] T004 Implement tracer provider initialization in app/lib/tracing.ts with console exporter
- [X] T005 Configure resource attributes (service name, version, environment, hostname) in app/lib/tracing.ts
- [X] T006 Setup SimpleSpanProcessor with ConsoleSpanExporter configuration in app/lib/tracing.ts (creates the exporter, does not register yet)
- [X] T007 Import tracing setup from app/lib/tracing.ts and register in instrumentation.ts while keeping auto-instrumentation active
- [X] T008 Export tracer instance from app/lib/tracing.ts for use in route handlers
- [X] T009 Create helper function for HTTP span creation with semantic conventions in app/lib/tracing.ts

**Checkpoint**: Foundation ready - endpoint instrumentation can now begin in parallel

---

## Phase 3: User Story 1 - View Trace Data in Console (Priority: P1) 🎯 MVP

**Goal**: Developers can see detailed JSON trace logs in console for every API request with trace ID, span ID, timestamps, and HTTP context

**Independent Test**: Start app with `npm run dev`, make API requests via browser or curl, verify console shows JSON trace output with all required fields (trace ID, span ID, operation name, duration, HTTP method, route, status code, resource attributes, "instrumentation": "manual")

### Implementation for User Story 1

- [X] T010 [P] [US1] Add manual trace span to GET /api/health endpoint in app/api/health/route.ts
- [X] T011 [P] [US1] Add manual trace span to GET /api/albums endpoint in app/api/albums/route.ts
- [X] T012 [P] [US1] Add manual trace span to GET /api/albums/[id] endpoint in app/api/albums/[id]/route.ts
- [X] T013 [P] [US1] Add manual trace span to GET /api/photos/[id] endpoint in app/api/photos/[id]/route.ts
- [X] T014 [US1] Add HTTP semantic convention attributes (method, route, status code) to health endpoint span
- [X] T015 [US1] Add HTTP semantic convention attributes (method, route, status code) to albums endpoint span
- [X] T016 [US1] Add HTTP semantic convention attributes (method, route, status code) to albums/[id] endpoint span
- [X] T017 [US1] Add HTTP semantic convention attributes (method, route, status code) to photos/[id] endpoint span
- [X] T018 [US1] Add custom "instrumentation": "manual" attribute to all endpoint spans
- [X] T019 [US1] Ensure route patterns use placeholders (e.g., /api/albums/[id]) not actual parameter values
- [X] T020 [US1] Verify console output is valid JSON format for all endpoints

**Checkpoint**: At this point, all endpoints should generate JSON trace logs in console with complete context

---

## Phase 4: User Story 2 - Understand Request Timing (Priority: P2)

**Goal**: Developers can see precise start/end timestamps and duration for each request to analyze operation sequencing

**Independent Test**: Trigger API requests and verify console shows timestamps in ISO 8601 format with milliseconds, plus calculated duration in nanoseconds

### Implementation for User Story 2

- [X] T021 [US2] Verify span timing is captured automatically (start/end timestamps and duration calculation in nanoseconds)
- [X] T022 [US2] Confirm timestamp format is ISO 8601 with millisecond precision in console output
- [X] T023 [US2] Test with endpoints that have measurable processing time to verify accurate duration

**Checkpoint**: All endpoints should now show precise timing information in ISO 8601 format

---

## Phase 5: User Story 3 - Identify Operations by Semantic Conventions (Priority: P3)

**Goal**: Traces use standardized OpenTelemetry semantic conventions for HTTP operations to follow industry best practices

**Independent Test**: Review console output and verify attribute names match OpenTelemetry HTTP semantic conventions (http.request.method, http.route, http.response.status_code) and resource attributes follow service identification conventions

### Implementation for User Story 3

- [X] T026 [US3] Verify all HTTP attributes use semantic convention constants from @opentelemetry/semantic-conventions
- [X] T027 [US3] Confirm span names follow meaningful pattern (e.g., "GET /api/albums")
- [X] T028 [US3] Verify resource attributes use semantic convention constants (service.name, service.version, deployment.environment, host.name)
- [X] T029 [US3] Review all attribute keys in console output match OpenTelemetry HTTP semantic convention specifications
- [X] T030 [US3] Validate span kind is set to "SERVER" for all HTTP endpoint handlers

**Checkpoint**: All traces should now follow OpenTelemetry semantic conventions and industry standards

---

## Phase 6: Error Handling & Edge Cases

**Purpose**: Handle error scenarios and edge cases identified in spec.md

- [X] T031 [P] Add error recording with span.recordException() for health endpoint error cases
- [X] T032 [P] Add error recording with span.recordException() for albums endpoint error cases
- [X] T033 [P] Add error recording with span.recordException() for albums/[id] endpoint error cases (invalid ID)
- [X] T034 [P] Add error recording with span.recordException() for photos/[id] endpoint error cases (invalid ID)
- [X] T035 Set span status to ERROR with message when exceptions occur in all endpoints
- [X] T036 Ensure spans are completed (span.end()) even when errors occur using try-finally blocks
- [X] T037 Verify full stack traces are captured in exception events
- [X] T039 Verify application continues functioning normally if console export fails
- [X] T040 Test error scenario with invalid album ID (999) to verify error capture

**Checkpoint**: Error handling should be robust with full stack traces and proper span completion

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [X] T041 Verify both auto-instrumentation and manual spans appear in console output
- [X] T042 [P] Manual verification: Start app and test all endpoints per quickstart.md checklist
- [X] T043 [P] Verify JSON output includes all required fields for successful requests
- [X] T044 [P] Verify JSON output includes exception events for error requests
- [X] T045 [P] Confirm "instrumentation": "manual" attribute present in all spans
- [X] T046 Test with browser navigation through photo album pages to trigger multiple endpoints
- [X] T047 Validate console output can be parsed as valid JSON
- [X] T048 Verify duration values are reasonable (in nanoseconds, divide by 1M for milliseconds)
- [X] T049 Confirm resource attributes appear correctly in all traces
- [X] T050 Final validation: Run through complete quickstart.md manual verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all endpoint instrumentation
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - Delivers MVP
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion (timing verification builds on existing traces)
- **User Story 3 (Phase 5)**: Depends on User Story 1 completion (semantic convention validation builds on existing traces)
- **Error Handling (Phase 6)**: Depends on User Story 1 completion (extends basic instrumentation)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - MVP CORE
- **User Story 2 (P2)**: Depends on User Story 1 completion (timing verification builds on existing traces - T021-T023 verify SDK automatic behavior)
- **User Story 3 (P3)**: Depends on User Story 1 (validates conventions on existing traces)

### Within Each Phase

**Phase 2 (Foundational)**:
1. T004-T006 can run in parallel (different concerns in tracing.ts)
2. T007 depends on T004-T006 (must have new setup before replacing old)
3. T008-T009 depend on T007 (helpers use new setup)

**Phase 3 (User Story 1)**:
1. T010-T013 can run in parallel (different endpoint files)
2. T014-T017 depend on their corresponding T010-T013 (attributes added to existing spans)
3. T018-T020 are final touches across all endpoints

**Phase 4 (User Story 2)**:
- Sequential verification tasks (T021-T023) checking automatic timing capture and format

**Phase 5 (User Story 3)**:
- Sequential verification tasks (T026-T030) checking semantic conventions

**Phase 6 (Error Handling)**:
- T031-T034 can run in parallel (different endpoint files)
- T035-T040 are sequential integration and testing (excluding T038)

**Phase 7 (Polish)**:
- T041-T045 can run in parallel (independent verification tasks)
- T046-T050 are sequential final validation

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel
- **Phase 2**: T004, T005, T006 can run in parallel
- **Phase 3**: 
  - T010, T011, T012, T013 (endpoint span creation) can run in parallel
- **Phase 6**:
  - T031, T032, T033, T034 (error handling per endpoint) can run in parallel
- **Phase 7**:
  - T042, T043, T044, T045 (independent verification) can run in parallel

---

## Parallel Example: User Story 1 Core Implementation

```bash
# Launch all endpoint span creation together:
Task T010: "Add manual trace span to GET /api/health endpoint in app/api/health/route.ts"
Task T011: "Add manual trace span to GET /api/albums endpoint in app/api/albums/route.ts"
Task T012: "Add manual trace span to GET /api/albums/[id] endpoint in app/api/albums/[id]/route.ts"
Task T013: "Add manual trace span to GET /api/photos/[id] endpoint in app/api/photos/[id]/route.ts"

# These can all run in parallel by different team members since they modify different files
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T009) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T010-T020)
4. **STOP and VALIDATE**: Test per quickstart.md - verify JSON traces appear in console
5. **MVP ACHIEVED**: All endpoints generate trace data with complete context

### Incremental Delivery

1. Complete Setup + Foundational (Phase 1-2) → Foundation ready
2. Add User Story 1 (Phase 3) → Test independently → **MVP! Console traces working**
3. Add User Story 2 (Phase 4) → Verify timing information → Enhanced traces
4. Add User Story 3 (Phase 5) → Validate semantic conventions → Standards-compliant traces
5. Add Error Handling (Phase 6) → Test error scenarios → Robust instrumentation
6. Polish & Validate (Phase 7) → Final checks → Production-ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phase 1-2)
2. Once Foundational is done:
   - Developer A: T010, T014 (health + albums endpoints)
   - Developer B: T011, T015 (albums endpoint)
   - Developer C: T012, T016, T013, T017 (albums/[id] + photos/[id] endpoints)
3. Team converges for T018-T020 (cross-cutting attributes)
4. User Story 1 complete - proceed to User Story 2 & 3

---

## Manual Verification Checklist (from quickstart.md)

After implementation, verify:

- [X] Application starts without errors (`npm run dev`)
- [X] Console shows trace data in JSON format
- [X] Each request generates unique traceId
- [X] Timestamps are in ISO 8601 format with milliseconds
- [X] Duration is calculated correctly (in nanoseconds)
- [X] HTTP method attribute is correct
- [X] Route uses pattern (e.g., /api/albums/[id]) not actual values
- [X] Status code matches actual response
- [X] Resource attributes include service name, version, environment, hostname
- [X] Custom "instrumentation": "manual" attribute is present
- [X] Error requests include exception events with stack trace
- [X] Application continues functioning normally even with instrumentation

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability (US1, US2, US3)
- Each user story should be independently verifiable per quickstart.md
- NO automated tests per Zero Testing Policy and user requirement
- Manual verification required after each phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
**Key files**: app/lib/tracing.ts (new), instrumentation.ts (modify to add console exporter, keep auto-instrumentation), 4 route.ts files (modify to add manual spans)

---

## Total Task Count

- **Setup**: 3 tasks
- **Foundational**: 6 tasks (BLOCKS all stories)
- **User Story 1 (P1 - MVP)**: 11 tasks
- **User Story 2 (P2)**: 3 tasks
- **User Story 3 (P3)**: 5 tasks
- **Error Handling**: 9 tasks
- **Polish**: 10 tasks
- **TOTAL**: 47 tasks

**MVP Scope** (Minimum for viable demo): Phase 1 + Phase 2 + Phase 3 = 20 tasks
**Full Feature**: All phases = 47 tasks
