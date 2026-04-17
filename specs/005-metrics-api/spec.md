# Feature Specification: API Metrics Correlated With Traces and Logs

**Feature Branch**: `005-metrics-api`  
**Created**: April 15, 2026  
**Status**: Draft  
**Input**: User description: "add metrics for API calls. that metrics should be related with traces and logs to see them in jegar, prometheus and grafana. For now, it has to be print in console."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Observe API Metrics Per Request (Priority: P1)

As a developer, I want every API call to emit structured metrics in console output, so I can immediately inspect request behavior during development.

**Why this priority**: Console-visible API metrics are the minimum usable observability signal for this phase.

**Independent Test**: Run the app locally, call each API endpoint, and confirm one structured metric event is emitted per request in console output.

**Acceptance Scenarios** (for manual verification):

1. **Given** the application is running, **When** I call any API endpoint, **Then** one API metric event is emitted to console.
2. **Given** successful requests, **When** metrics are printed, **Then** they include route, method, status code, and duration.
3. **Given** failed requests, **When** metrics are printed, **Then** they include failure outcome and error classification.

---

### User Story 2 - Correlate Metrics With Traces and Logs (Priority: P2)

As a developer, I want API metric events to carry the same correlation context used by traces and logs, so I can connect all three telemetry signals for the same request.

**Why this priority**: Correlation across signals is required to troubleshoot effectively, even before external exporters are enabled.

**Independent Test**: Trigger API requests and verify each metric event includes correlation identifiers and route context that match corresponding trace/log entries.

**Acceptance Scenarios**:

1. **Given** a request creates trace and log context, **When** the API metric is emitted, **Then** it includes matching correlation identifiers.
2. **Given** multiple concurrent requests, **When** I review telemetry output, **Then** each metric can be mapped to its own trace/log timeline.
3. **Given** partial telemetry context loss, **When** a metric is emitted, **Then** it includes a clear missing-correlation marker.

---

### User Story 3 - Keep Metrics Export-Ready for Jaeger, Prometheus, and Grafana (Priority: P3)

As a developer, I want metric event structure and naming to be stable and tool-friendly, so future export to Jaeger, Prometheus, and Grafana can be enabled with minimal rework.

**Why this priority**: External visualization is the next step after console-first delivery, so schema stability now prevents migration churn later.

**Independent Test**: Review emitted metric events and validate stable field names, consistent value types, and canonical metric naming conventions across all endpoints.

**Acceptance Scenarios**:

1. **Given** success and failure requests across endpoints, **When** metric events are emitted, **Then** key names and value types are consistent.
2. **Given** future export requirements, **When** metric payloads are reviewed, **Then** they already include fields needed for cross-signal correlation and dashboarding.
3. **Given** dynamic routes, **When** metrics are emitted, **Then** route labels are normalized to templates instead of concrete identifiers.

---

### Edge Cases

- What happens when trace or log correlation context is unavailable? Metric emission must still occur with explicit missing-correlation state.
- What happens when an endpoint throws before response completion? A metric event must still be emitted with failure outcome.
- What happens under burst traffic? Metric records must remain request-distinct and correlation-safe.
- What happens if metric emission fails? Endpoint behavior must continue without causing request failure.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST emit one structured API metric event per handled API request.
- **FR-002**: System MUST include request context in each metric event: HTTP method, normalized route, and status code.
- **FR-003**: System MUST include request duration in milliseconds in each metric event.
- **FR-004**: System MUST include outcome classification in each metric event (`success` or `error`).
- **FR-005**: System MUST include trace/log correlation identifiers in each metric event when available: `trace_id`, `span_id`, and `request_id`.
- **FR-006**: System MUST include a correlation-state marker when identifiers are unavailable.
- **FR-007**: System MUST emit API metric events to console as the default active destination for this phase.
- **FR-008**: System MUST use stable metric field names and value types across all API endpoints.
- **FR-009**: System MUST emit metric events for both successful and failed API requests.
- **FR-010**: System MUST avoid logging sensitive payload content in metric events by default.
- **FR-011**: System MUST ensure endpoint behavior continues even if metric emission fails.
- **FR-012**: System MUST keep emitted metric schema compatible with future integration workflows for Jaeger, Prometheus, and Grafana.
- **FR-013**: System MUST include `status_class` in each metric event using HTTP status group labels (`1xx`, `2xx`, `3xx`, `4xx`, `5xx`).
- **FR-014**: System MUST use `environment=local` as the default environment label for local runs unless explicitly overridden.
- **FR-015**: System MUST limit this phase to one completion metric event per request and MUST NOT require aggregated counters or histograms.

### Key Entities

- **ApiMetricEvent**: A structured telemetry record emitted once per API request with request metadata, duration, outcome, and correlation context.
- **CorrelationContext**: Correlation identifiers and state used to connect metric events with trace and log records from the same request.
- **MetricSchemaProfile**: A stable contract of metric field names, value types, and required/optional attributes for console output now and exporter usage later.

## Assumptions and Dependencies

- Existing trace and endpoint logging instrumentation remains active and available for correlation.
- Console output remains available in local development and study environments.
- External export wiring to Jaeger, Prometheus, and Grafana is out of current scope, but schema readiness is in scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of manually tested API requests emit exactly one structured metric event.
- **SC-002**: 100% of manually tested metric events include method, normalized route, status code, duration, and outcome.
- **SC-003**: Developers can correlate a metric event to its related trace/log context in under 30 seconds during manual troubleshooting.
- **SC-004**: Metric field naming and value typing remain consistent across all manually tested endpoints with zero schema drift.
- **SC-005**: No manually observed endpoint failures are caused by metric emission logic.

## Clarifications

### Session 2026-04-15

- Q: Which API endpoints are in scope for this feature? → A: All current API routes (`/api/health`, `/api/albums`, `/api/albums/[id]`, `/api/photos/[id]`).
- Q: Should this phase include aggregated metrics in addition to per-request events? → A: No. Emit one structured completion event per request only.
- Q: Which correlation identifiers are required when available? → A: `trace_id`, `span_id`, and `request_id`.
- Q: What error classification format should be used? → A: `status_class` only.
- Q: What default environment label should local runs use? → A: `local`.
