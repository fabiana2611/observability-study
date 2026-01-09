# Feature Specification: Manual OpenTelemetry Trace Instrumentation

**Feature Branch**: `003-otel-manual-traces`  
**Created**: January 9, 2026  
**Status**: Draft  
**Input**: User description: "add a manual instrumentation for traces to track endpoints call for nextjs application. it must add instrumentation to the code that creates and finishes spans. Enrich Spans with Context. Add resource attributes. Use semantic conventions. Also, add dynamic context with http info (request method, url, response status code). Export collected data from OpenTelemetry to console. Have in mind it is a study scope and we have to reduce complexity. It is not necessary unit tests, or integration tests or e2e tests."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Trace Data in Console (Priority: P1)

As a developer studying observability, I want to see detailed trace information logged to the console when API endpoints are called, so I can understand the request flow and timing without setting up external monitoring infrastructure.

**Why this priority**: This is the core value of the feature - enabling immediate visibility into application behavior through console output. Without this, there is no observable benefit from adding instrumentation.

**Independent Test**: Can be fully tested by starting the application (`npm run dev`), opening a browser to localhost:3000, navigating through the photo album pages to trigger API calls (albums list, album details, photo details), and verifying that the console displays structured JSON trace logs including trace IDs, span IDs, timestamps, and HTTP context.

**Acceptance Scenarios** (for manual verification):

1. **Given** the application is running, **When** I make a request to any API endpoint, **Then** I should see JSON console output containing trace ID, span ID, operation name, and duration
2. **Given** the application is running, **When** I make a request to an API endpoint, **Then** the console output should include HTTP method, URL path, and response status code
3. **Given** the application is running, **When** I navigate through multiple pages triggering different endpoints, **Then** each request should generate distinct trace IDs in the console
4. **Given** the application is running, **When** a trace is logged to console, **Then** the output should include resource attributes identifying the application

---

### User Story 2 - Understand Request Timing (Priority: P2)

As a developer studying observability, I want to see when spans start and finish with precise timestamps, so I can analyze the duration and sequencing of operations within each request.

**Why this priority**: Timing information is essential for understanding request flow and identifying operation sequencing. This adds analytical value beyond basic request tracking.

**Independent Test**: Can be tested by triggering API requests and verifying the console shows span start time, end time in ISO 8601 format with milliseconds, and calculated duration in a human-readable format.

**Acceptance Scenarios**:

1. **Given** an API endpoint is called, **When** the trace is logged to console, **Then** the span should show start timestamp, end timestamp in ISO 8601 format, and duration
2. **Given** an endpoint processing takes measurable time, **When** the trace is logged, **Then** the duration should accurately reflect the processing time
3. **Given** multiple operations happen within a request, **When** traces are logged, **Then** timestamps should show proper sequence of span creation and completion

---

### User Story 3 - Identify Operations by Semantic Conventions (Priority: P3)

As a developer studying observability best practices, I want traces to use standardized semantic conventions for HTTP operations, so I can learn industry-standard patterns and ensure compatibility with observability tools in the future.

**Why this priority**: Following semantic conventions provides learning value and ensures the instrumentation follows best practices, though it doesn't change the immediate functional output for study purposes.

**Independent Test**: Can be tested by reviewing console output and verifying that span names, attribute keys, and values follow OpenTelemetry semantic conventions (e.g., `http.method`, `http.route`, `http.status_code`).

**Acceptance Scenarios**:

1. **Given** an HTTP request is instrumented, **When** the trace is logged, **Then** HTTP attributes should use standard names like `http.method`, `http.url`, and `http.status_code`
2. **Given** a trace includes resource attributes, **When** logged to console, **Then** attributes should follow semantic conventions for service identification
3. **Given** span operations are named, **When** logged, **Then** names should follow the pattern `HTTP {METHOD}` or describe the operation meaningfully

---

### Edge Cases

- What happens when an endpoint throws an error during processing? The span should capture the error status, error type, error message, and full stack trace, then be completed properly.
- How does the system handle endpoints with dynamic route parameters (e.g., `/api/albums/[id]`)? The span should log the route pattern to maintain consistency across different parameter values.
- What happens if console export fails or is unavailable? The application should continue functioning normally without crashing.
- How are concurrent requests handled? Each request should generate independent traces with unique trace IDs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create a new trace span when an API endpoint handler begins processing a request
- **FR-002**: System MUST complete and close the span when the endpoint handler finishes processing, capturing error status, error type, error message, and full stack trace for error cases
- **FR-003**: System MUST enrich spans with HTTP context including request method, URL path, and response status code
- **FR-004**: System MUST add resource attributes to identify the application including service name, version, environment (development/production), and hostname
- **FR-005**: System MUST use OpenTelemetry semantic conventions for HTTP attribute naming and values
- **FR-006**: System MUST export trace data to console output as structured JSON logs containing all span details
- **FR-007**: System MUST generate unique trace IDs and span IDs for each request
- **FR-008**: System MUST record span start and end timestamps in ISO 8601 format with millisecond precision
- **FR-009**: System MUST continue normal application operation even if tracing or export encounters errors
- **FR-010**: Instrumentation MUST be added directly to endpoint code (manual instrumentation, not auto-instrumentation)
- **FR-011**: Console output MUST include sufficient detail for a developer to understand the request flow without external tools
- **FR-012**: System MUST log actual route patterns for dynamic route parameters (e.g., `/api/albums/[id]`) to maintain consistency across requests

### Key Entities

- **Trace**: Represents the complete journey of a single request through the system, identified by a unique trace ID. Contains one or more spans and provides end-to-end visibility.
  
- **Span**: Represents a single operation or unit of work within a trace. Contains timing information (start time, end time, duration), operation name, attributes describing the operation, and relationships to other spans.

- **Resource Attributes**: Metadata describing the application generating the telemetry data. Includes service name, service version, environment (development/production), and hostname. These attributes apply to all traces from this application instance.

- **Span Attributes**: Key-value pairs providing additional context about a specific operation. For HTTP operations, includes method, URL, status code, and other request/response details following semantic conventions.

## Clarifications

### Session 2026-01-09

- Q: When traces are exported to "console," what specific output format should be used? → A: Structured JSON logs for each span that can be easily parsed and analyzed
- Q: What specific parameters or data should be considered "sensitive" and excluded from trace logs? → A: No sensitive data filtering needed for study scope
- Q: When an endpoint throws an error, what error information should be captured in the span? → A: Full error with stack trace included in span attributes
- Q: What resource attributes should identify the application in trace logs? → A: Service name, version, environment (dev/prod), and hostname
- Q: Should timestamps in console output be displayed in a specific format? → A: ISO 8601 format with milliseconds

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can observe trace information for any API endpoint call within 1 second of the request completing (visible in console)
- **SC-002**: Console output includes all essential trace elements (trace ID, span ID, operation name, duration, HTTP context) in every logged trace
- **SC-003**: 100% of API endpoint calls generate trace data that appears in console output
- **SC-004**: Application continues to function normally even when trace export encounters errors (zero crashes related to instrumentation)
- **SC-005**: Developers can distinguish between different endpoint calls by examining console output (unique identifiers and clear operation names)
- **SC-006**: HTTP context attributes in console output match actual request details with 100% accuracy
