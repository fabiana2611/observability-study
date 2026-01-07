# Tasks: Zero-Code OpenTelemetry Observability with Console Export

**Input**: Design documents from `/specs/002-otel-console-export/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Per the Zero Testing Policy, NO automated tests will be created. Manual verification in browser is required instead.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and OpenTelemetry package installation

- [X] T001 Install @opentelemetry/sdk-node package via npm
- [X] T002 Install @opentelemetry/auto-instrumentations-node package via npm
- [X] T003 Verify Next.js version is 16.1.1 or higher (instrumentation hook support required)

**Checkpoint**: Dependencies installed - ready to create configuration files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core OpenTelemetry configuration that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create instrumentation.ts at project root with NodeSDK initialization (~12 lines per quickstart.md)
- [X] T005 [P] Create .env.local at project root with OTEL_* environment variables
- [X] T006 [P] Update next.config.ts to enable experimental.instrumentationHook
- [X] T007 Verify instrumentation.ts only imports SDK and auto-instrumentations (zero custom logic)

**Checkpoint**: Foundation ready - OpenTelemetry SDK will initialize on application start

---

## Phase 3: User Story 1 - View Application Telemetry in Real-Time (Priority: P1) 🎯 MVP

**Goal**: Developers can immediately see application behavior, performance metrics, and errors as they interact with the application during development. System automatically captures and displays traces without manual instrumentation.

**Independent Test**: Start application in dev mode, open browser console, navigate through pages (home, album view, photo detail), verify telemetry data (HTTP requests, timing, trace IDs) appears automatically in terminal console output.

### Implementation for User Story 1

- [ ] T008 [US1] Start dev server (`npm run dev`) and verify no startup errors in console
- [ ] T009 [US1] Navigate to homepage (http://localhost:3000) and verify HTTP span for GET / appears in terminal
- [ ] T010 [US1] Check terminal output for span attributes: http.method, http.url, http.status_code
- [ ] T011 [US1] Navigate to /album/1 and verify new trace with traceId in terminal output
- [ ] T012 [US1] Verify span shows parent-child relationship (page request → API call → database query)
- [ ] T013 [US1] Trigger 404 error by visiting /album/999999 and verify error span with status.code = 2 in terminal
- [ ] T014 [US1] Verify each trace includes correlation via consistent traceId across related spans
- [ ] T015 [US1] Check that resource attributes appear (service.name, telemetry.sdk.name) in span output

**Checkpoint**: User Story 1 complete - Basic telemetry capture and console export functional

---

## Phase 4: User Story 2 - Monitor Application Performance Patterns (Priority: P2)

**Goal**: Developers can understand performance characteristics - which operations are slow, typical response time distribution, where bottlenecks exist. System collects timing metrics for all operations automatically.

**Independent Test**: Run application, perform typical workflows (browse 10 albums, view 5 photos, trigger 2-3 errors). Review console output to find timing data (duration field) showing response times for different operation types.

### Implementation for User Story 2

- [ ] T016 [US2] Perform 10 album page visits and record duration values from terminal output
- [ ] T017 [US2] Calculate min/max/avg response times manually from collected duration fields
- [ ] T018 [US2] Identify spans with duration > 1000000 microseconds (1 second) from console output
- [ ] T019 [US2] Navigate through application and verify timestamp + duration fields present on all spans
- [ ] T020 [US2] Compare durations across span kinds (kind: 1=SERVER, kind: 2=CLIENT, kind: 0=INTERNAL)
- [ ] T021 [US2] Verify all operation types are captured: HTTP requests (kind:1), database queries (kind:0), internal operations (kind:0)
- [ ] T022 [US2] Document typical performance baseline in quickstart.md Examples section

**Checkpoint**: User Story 2 complete - Performance monitoring via timing data in console output functional

---

## Phase 5: User Story 3 - Trace Requests Across Application Layers (Priority: P3)

**Goal**: Developers can follow a single user request through all application layers - browser interaction → API routes → database operations. System maintains trace context and displays complete request path.

**Independent Test**: Trigger specific action (view photo #5), note traceId from console, verify all related operations (browser navigation, Next.js SSR, API route, database query) share same traceId and show parent-child relationships via parentId field.

### Implementation for User Story 3

- [ ] T023 [US3] Navigate to /photo/5 and capture the traceId from first span in terminal output
- [ ] T024 [US3] Search terminal output for all spans with same traceId (use grep or terminal search)
- [ ] T025 [US3] Verify operation chain: root span (parentId: undefined) → child spans (parentId: <parent_id>)
- [ ] T026 [US3] Identify spans for: page request (kind: 1), API call (kind: 2), database query (kind: 0)
- [ ] T027 [US3] Trigger error in /album/abc and verify entire trace chain shows in terminal with consistent traceId
- [ ] T028 [US3] Test concurrent requests: Open 3 browser tabs simultaneously, verify traces have distinct traceIds
- [ ] T029 [US3] Document trace correlation examples in quickstart.md Tracing section

**Checkpoint**: User Story 3 complete - Distributed tracing across application layers functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and improvements affecting multiple user stories

- [ ] T030 [P] Update README.md with link to quickstart.md for observability setup
- [ ] T031 [P] Document default OTLP format characteristics in quickstart.md (microsecond timestamps, integer enums)
- [ ] T032 Verify instrumentation.ts contains no custom SpanProcessors, Exporters, or filtering logic
- [ ] T033 Run quickstart.md validation: Follow all setup steps from scratch in clean environment
- [ ] T034 Document known limitations: Verbose OTLP format, no custom filtering
- [ ] T035 Add example console output snippets to quickstart.md showing actual OTLP JSON
- [ ] T036 [P] Check that .env.local is in .gitignore to prevent committing environment config
- [ ] T037 Verify telemetry overhead <5% by comparing response times with/without OTEL_SDK_DISABLED=true

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational (Phase 2) completion
  - User stories can proceed in parallel (if multiple developers)
  - Or sequentially in priority order: US1 (P1) → US2 (P2) → US3 (P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 - No dependencies on other stories
- **User Story 2 (P2)**: Depends on Phase 2 - Independent of US1 (but US1 validates basic capture works)
- **User Story 3 (P3)**: Depends on Phase 2 - Independent of US1/US2 (but US1 establishes baseline tracing)

### Within Each User Story

- All tasks are manual verification steps - must be executed sequentially
- Each task verifies one aspect of the user story acceptance criteria
- Tasks build understanding progressively (basic capture → attributes → relationships → errors)

### Parallel Opportunities

**Phase 1 (Setup)**:
- All 3 npm install/verification tasks can run sequentially (npm install handles dependencies)

**Phase 2 (Foundational)**:
- T005 (.env.local creation) and T006 (next.config.ts update) can run in parallel [P]
- T004 (instrumentation.ts) must complete before T007 (verification)

**Phase 6 (Polish)**:
- T031, T034, T036 (.gitignore check) can run in parallel [P]

**User Stories (Phase 3-5)**:
- If team capacity allows, US1, US2, US3 can be validated in parallel by different developers
- Each story has independent test criteria

---

## Parallel Example: Foundational Phase

**Team of 2 developers**:

Developer A:
1. T004: Create instrumentation.ts (5 min)
2. T007: Verify zero custom logic (2 min)

Developer B (in parallel):
1. T005: Create .env.local (2 min)
2. T006: Update next.config.ts (2 min)

**Total time**: ~7 minutes (vs 11 minutes sequential)

---

## Parallel Example: User Story Validation

**Team of 3 developers** (after Phase 2 complete):

Developer A: Validates US1 (P1) - Basic telemetry capture (8 tasks, ~30 min)
Developer B: Validates US2 (P2) - Performance monitoring (7 tasks, ~25 min)
Developer C: Validates US3 (P3) - Distributed tracing (7 tasks, ~25 min)

**Total time**: ~30 minutes (vs ~80 minutes sequential)

---

## Implementation Strategy

### Recommended MVP Scope

**Minimum Viable Product**: User Story 1 only (Phase 1 + Phase 2 + Phase 3)

This delivers:
- ✅ Zero-code automatic instrumentation
- ✅ Console telemetry export
- ✅ HTTP request tracing
- ✅ Basic error capture
- ✅ Trace correlation via traceId

**Estimated Time**: 15-20 minutes (with quickstart.md as guide)

### Incremental Delivery

1. **Sprint 1**: MVP (US1) - Basic observability working
2. **Sprint 2**: Add US2 - Performance analysis capabilities validated
3. **Sprint 3**: Add US3 - Distributed tracing validation complete
4. **Sprint 4**: Polish phase - Documentation and final validation

### Validation Approach

**Manual Testing Only** (Zero Testing Policy):

1. Follow quickstart.md setup steps exactly
2. Execute each user story's "Independent Test" scenario
3. Verify console output matches expected OTLP format from data-model.md
4. Check examples in contracts/telemetry-output.yaml for reference format
5. Document any deviations from expected behavior in quickstart.md

---

## Task Summary

**Total Tasks**: 37
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 4 tasks (BLOCKING)
- Phase 3 (User Story 1 - P1): 8 tasks
- Phase 4 (User Story 2 - P2): 7 tasks
- Phase 5 (User Story 3 - P3): 7 tasks
- Phase 6 (Polish): 8 tasks

**Parallelizable Tasks**: 6 tasks marked [P]

**Story-Specific Tasks**: 22 tasks (8 US1, 7 US2, 7 US3)

**Estimated Total Time**:
- Sequential: ~2 hours
- With parallelization: ~1.5 hours
- MVP only (US1): ~20 minutes

**Format Validation**: ✅ All tasks follow checklist format
- ✅ All tasks have checkbox `- [ ]`
- ✅ All tasks have sequential ID (T001-T037)
- ✅ All story tasks have [US#] label
- ✅ All parallel tasks have [P] marker
- ✅ All tasks include specific file paths or verification criteria
