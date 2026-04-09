# Feature Specification: Endpoint Logs Correlated With Traces

**Feature Branch**: `004-trace-correlated-logs`  
**Created**: April 7, 2026  
**Status**: Draft  
**Input**: User description: "add logs for endpoints. These logs must be related to the traces. For now it will be printed in console but should be already created to be ready to send it to external tools as jager, prometheus."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested manually (Zero Testing Policy - no automated tests)
  - Deployed independently
  - Demonstrated to users independently
  
  NOTE: All testing is MANUAL verification in browser across required viewports (mobile, tablet, desktop).
-->

### User Story 1 - Observe Endpoint Logs Per Request (Priority: P1)

As a developer, I want every endpoint call to emit a structured console log entry that is correlated to its trace, so I can inspect behavior and failures from terminal output during development.

**Why this priority**: This is the core observability need. Without correlated logs, trace context is difficult to follow during debugging.

**Independent Test**: Can be fully tested by running the app locally, calling each API endpoint, and confirming a structured console log appears for each request with correlation identifiers and request outcome.

**Acceptance Scenarios** (for manual verification):

1. **Given** the application is running, **When** I call any API endpoint, **Then** a console log entry is emitted for that request.
2. **Given** a request creates a trace span, **When** the endpoint log is printed, **Then** the log includes the same trace correlation data (trace identifier and span identifier).
3. **Given** two different requests, **When** I review console output, **Then** I can distinguish them by unique correlation identifiers and route context.

---

### User Story 2 - Keep Logs Export-Ready (Priority: P2)

As a developer, I want endpoint logs to use a stable structured schema that aligns with trace context, so the same log payload can later be forwarded to external tools such as Jaeger and Prometheus pipelines with minimal changes.

**Why this priority**: Console visibility solves immediate needs, but schema consistency is required to avoid rework when external integrations are enabled.

**Independent Test**: Can be tested by triggering requests, collecting console output, and validating all entries follow the same key set and value formats expected by downstream tooling.

**Acceptance Scenarios**:

1. **Given** successful and failed requests, **When** logs are emitted, **Then** all entries use the same structured field names and value types.
2. **Given** the need to ship logs externally in the future, **When** reviewing the emitted payload, **Then** required correlation and endpoint fields are already present without redesign.

---

### User Story 3 - Troubleshoot Errors With Correlated Context (Priority: P3)

As a developer, I want error logs to include the same trace correlation context as successful logs, so I can quickly connect failures to their request timeline and investigate root causes.

**Why this priority**: Error diagnosis is faster when trace and log data share correlation identifiers and route metadata.

**Independent Test**: Can be tested by forcing error responses and verifying the emitted error log still contains route and trace correlation fields, plus error details.

**Acceptance Scenarios**:

1. **Given** an endpoint throws or returns an error response, **When** the log is emitted, **Then** it includes correlation identifiers, route context, status, and error summary.
2. **Given** a request fails before normal completion, **When** console output is inspected, **Then** the log still appears and contains enough data to map the failure to its trace.

---

### Edge Cases

- What happens when trace context is partially unavailable for a request? The log must still be emitted with fallback correlation fields and a clear marker that context is incomplete.
- How does the system handle an exception thrown before response status is finalized? The log must still capture failure outcome and error context.
- What happens under burst traffic with many concurrent requests? Each log line must remain uniquely correlated to its own request.
- How are dynamic routes handled? Logs must report normalized route patterns and request identifiers consistently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST emit one structured endpoint log event for every API request handled by application endpoints.
- **FR-002**: System MUST include correlation fields in each endpoint log event that map directly to trace context, including trace identifier and span identifier when available.
- **FR-003**: System MUST include request context in each endpoint log event, including method and route.
- **FR-004**: System MUST include outcome context in each endpoint log event, including response status and result category (success or error).
- **FR-005**: System MUST include timestamp information in each endpoint log event in a consistent machine-readable format.
- **FR-006**: System MUST emit endpoint logs to console output as the default active destination.
- **FR-007**: System MUST define a stable structured log schema that is forward-compatible with external observability pipelines, including Jaeger-oriented trace correlation workflows and Prometheus-adjacent log ingestion pipelines.
- **FR-008**: System MUST keep log field names and value types consistent across endpoints, including dynamic route handlers.
- **FR-009**: System MUST emit an endpoint log event for failed requests and include error summary information without preventing normal error responses.
- **FR-010**: System MUST continue endpoint execution even if log emission fails.
- **FR-011**: System MUST avoid including sensitive request payload content in endpoint logs by default.
- **FR-012**: System MUST provide sufficient endpoint log context for manual troubleshooting without requiring immediate external tooling setup.

### Key Entities *(include if feature involves data)*

- **Endpoint Log Event**: A structured record emitted once per endpoint request containing timestamp, request context, outcome context, and correlation context.
- **Trace Correlation Context**: The pair of identifiers and related metadata used to connect a log event to its trace/span timeline.
- **Log Schema Profile**: The agreed field contract that keeps console output consistent now and compatible with external ingestion later.

## Assumptions and Dependencies

- Existing endpoint tracing remains active and provides correlation data for most requests.
- Console output remains available in local and study environments where this feature is verified.
- External log shipping to Jaeger or Prometheus-related pipelines is out of current scope, but schema readiness is in scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of manually tested endpoint requests produce exactly one structured console log event.
- **SC-002**: 100% of manually tested endpoint log events include correlation identifiers (or an explicit missing-context marker) and route metadata.
- **SC-003**: Developers can identify the matching trace context for a specific endpoint log within 30 seconds during manual troubleshooting.
- **SC-004**: Structured log schema remains consistent across all tested endpoints with no field-name drift during manual verification.
- **SC-005**: Endpoint behavior remains stable, with zero request failures caused by logging logic during manual validation.
