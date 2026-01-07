# Tasks: Zero-Code OpenTelemetry Observability with Console Export

**Input**: Design documents from `/specs/002-otel-console-export/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Per the Zero Testing Policy, NO automated tests will be created. Manual verification in browser is required instead.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
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

- [X] T008 [US1] Start dev server (`npm run dev`) and verify no startup errors in console
- [X] T009 [US1] Navigate to homepage (http://localhost:3000) and verify HTTP span for GET / appears in terminal
- [X] T010 [US1] Check terminal output for span attributes: http.method, http.url, http.status_code
- [X] T011 [US1] Navigate to /album/1 and verify new trace with traceId in terminal output
- [X] T012 [US1] Verify span shows parent-child relationship (page request → API call → database query)
- [X] T013 [US1] Trigger 404 error by visiting /album/999999 and verify error span with status.code = 2 in terminal
- [X] T014 [US1] Verify each trace includes correlation via consistent traceId across related spans
- [X] T015 [US1] Check that resource attributes appear (service.name, telemetry.sdk.name) in span output

**Checkpoint**: User Story 1 complete - Basic telemetry capture and console export functional

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and improvements affecting multiple user stories

- [X] T016 [P] Update README.md with link to quickstart.md for observability setup
- [X] T017 [P] Document default OTLP format characteristics in quickstart.md (microsecond timestamps, integer enums)
- [X] T018 Verify instrumentation.ts contains no custom SpanProcessors, Exporters, or filtering logic
- [X] T019 Run quickstart.md validation: Follow all setup steps from scratch in clean environment
- [X] T020 Document known limitations: Verbose OTLP format, no custom filtering
- [X] T021 Add example console output snippets to quickstart.md showing actual OTLP JSON
- [X] T022 [P] Check that .env.local is in .gitignore to prevent committing environment config

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Story (Phase 3)**: Depends on Foundational (Phase 2) completion
- **Polish (Phase 4)**: Depends on user story being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 - Core MVP functionality

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

**Phase 4 (Polish)**:
- T017, T020, T022 (.gitignore check) can run in parallel [P]

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
2. **Sprint 2**: Polish phase - Documentation and final validation

### Validation Approach

**Manual Testing Only** (Zero Testing Policy):

1. Follow quickstart.md setup steps exactly
2. Execute each user story's "Independent Test" scenario
3. Verify console output matches expected OTLP format from data-model.md
4. Check examples in contracts/telemetry-output.yaml for reference format
5. Document any deviations from expected behavior in quickstart.md

---

## Task Summary

**Total Tasks**: 22
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 4 tasks (BLOCKING)
- Phase 3 (User Story 1 - P1): 8 tasks
- Phase 4 (Polish): 7 tasks

**Parallelizable Tasks**: 6 tasks marked [P]

**Story-Specific Tasks**: 8 tasks (US1 only)

**Estimated Total Time**:
- Sequential: ~2 hours
- With parallelization: ~1.5 hours
- MVP only (US1): ~20 minutes

**Format Validation**: ✅ All tasks follow checklist format
- ✅ All tasks have checkbox `- [ ]`
- ✅ All tasks have sequential ID (T001-T023)
- ✅ All story tasks have [US#] label
- ✅ All parallel tasks have [P] marker
- ✅ All tasks include specific file paths or verification criteria
