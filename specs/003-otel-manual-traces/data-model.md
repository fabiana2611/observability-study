# Data Model: Manual OpenTelemetry Trace Instrumentation

**Feature**: Manual OpenTelemetry Trace Instrumentation  
**Branch**: 003-otel-manual-traces  
**Date**: January 9, 2026

## Overview

This document defines the telemetry data structures for manual OpenTelemetry trace instrumentation. These are conceptual models representing what will be captured and exported, not database schemas (no data persistence for telemetry).

## Core Entities

### Trace

Represents the complete journey of a single HTTP request through the system.

**Attributes**:
- `traceId`: Unique identifier for the entire request trace (string, hexadecimal format, 32 characters)
- `spans`: Collection of one or more spans that comprise this trace
- `resource`: Resource attributes identifying the service that generated this trace

**Relationships**:
- Contains one or more Spans (1:N)
- Associated with one Resource (1:1)

**Lifecycle**:
- Created implicitly when first span starts for a request
- Completed when all spans in the trace are ended
- No explicit creation/destruction - managed by OpenTelemetry SDK

**Example**:
```json
{
  "traceId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "spans": [{ /* span data */ }],
  "resource": { /* resource attributes */ }
}
```

---

### Span

Represents a single operation or unit of work within a trace (HTTP request handling).

**Attributes**:
- `spanId`: Unique identifier for this span (string, hexadecimal format, 16 characters)
- `traceId`: Identifier of the parent trace (string, hexadecimal format, 32 characters)
- `parentSpanId`: Identifier of parent span if nested (string, optional, null for root spans)
- `name`: Human-readable operation name (string, e.g., "GET /api/albums")
- `kind`: Span kind (enum: "SERVER" for HTTP endpoint handlers)
- `startTime`: When the operation started (string, ISO 8601 format with milliseconds)
- `endTime`: When the operation completed (string, ISO 8601 format with milliseconds)
- `duration`: Time elapsed between start and end (number, milliseconds)
- `status`: Execution status (object with `code` and optional `message`)
- `attributes`: Key-value pairs providing operation context (object)
- `events`: Collection of events that occurred during span (array, includes exceptions)

**Status Object**:
- `code`: Status code enum ("OK", "ERROR", "UNSET")
- `message`: Optional error description (string, only for ERROR status)

**Relationships**:
- Belongs to one Trace (N:1)
- May have a parent Span (N:1, optional)
- Contains zero or more Events (1:N)
- Has multiple Attributes (1:N)

**Lifecycle**:
1. **Creation**: `tracer.startSpan(name)` - creates span, records start time
2. **Enrichment**: `span.setAttribute()` - add contextual attributes
3. **Error Handling**: `span.recordException()` + `span.setStatus()` - capture errors
4. **Completion**: `span.end()` - records end time, calculates duration, exports

**Example**:
```json
{
  "spanId": "1234567890abcdef",
  "traceId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "parentSpanId": null,
  "name": "GET /api/albums",
  "kind": "SERVER",
  "startTime": "2026-01-09T14:23:45.123Z",
  "endTime": "2026-01-09T14:23:45.234Z",
  "duration": 111,
  "status": { "code": "OK" },
  "attributes": {
    "http.request.method": "GET",
    "http.route": "/api/albums",
    "http.response.status_code": 200,
    "instrumentation": "manual"
  },
  "events": []
}
```

---

### Resource Attributes

Metadata describing the application/service generating telemetry data. These are static attributes set once at initialization.

**Attributes**:
- `service.name`: Name of the service (string, e.g., "observability-study")
- `service.version`: Version of the service (string, from package.json)
- `deployment.environment`: Environment where service runs (string, "development" or "production")
- `host.name`: Hostname of the machine running the service (string, from OS)

**Relationships**:
- Applies to all Traces from this service instance (1:N with Traces)
- Applies to all Spans from this service instance (1:N with Spans)

**Lifecycle**:
- Created once at application startup
- Remains constant for the entire application lifetime
- Attached automatically to all exported telemetry

**Example**:
```json
{
  "service.name": "observability-study",
  "service.version": "0.1.0",
  "deployment.environment": "development",
  "host.name": "macbook-pro.local"
}
```

---

### Span Attributes

Key-value pairs providing additional context about a specific span operation. These follow OpenTelemetry semantic conventions for HTTP operations.

**Standard HTTP Attributes**:
- `http.request.method`: HTTP method (string, e.g., "GET", "POST")
- `http.route`: Route pattern (string, e.g., "/api/albums/[id]")
- `http.response.status_code`: HTTP response status code (number, e.g., 200, 404, 500)

**Custom Attributes**:
- `instrumentation`: Instrumentation type (string, always "manual" for this implementation)

**Relationships**:
- Belongs to one Span (N:1)

**Lifecycle**:
- Added during span execution via `span.setAttribute(key, value)`
- Immutable once span is ended
- Exported as part of span data

**Example**:
```json
{
  "http.request.method": "GET",
  "http.route": "/api/albums/[id]",
  "http.response.status_code": 200,
  "instrumentation": "manual"
}
```

---

### Span Events

Records of significant occurrences during span execution, primarily used for exception recording.

**Attributes**:
- `name`: Event name (string, e.g., "exception")
- `timestamp`: When event occurred (string, ISO 8601 format with milliseconds)
- `attributes`: Event-specific attributes (object)

**Exception Event Attributes**:
- `exception.type`: Error class name (string, e.g., "Error", "TypeError")
- `exception.message`: Error message (string)
- `exception.stacktrace`: Full stack trace (string)

**Relationships**:
- Belongs to one Span (N:1)

**Lifecycle**:
- Created via `span.recordException(error)` when error occurs
- Automatically includes timestamp, type, message, and stack trace
- Exported as part of span data

**Example**:
```json
{
  "name": "exception",
  "timestamp": "2026-01-09T14:23:45.200Z",
  "attributes": {
    "exception.type": "Error",
    "exception.message": "Album not found",
    "exception.stacktrace": "Error: Album not found\n    at GET (route.ts:15:11)\n    ..."
  }
}
```

## Data Flow

```
Request Arrives at API Endpoint
          ↓
    Span Created (start time recorded)
          ↓
    HTTP Attributes Added (method, route)
          ↓
    Business Logic Executes
          ↓
    Success Path              Error Path
          ↓                       ↓
    Status Code Added       Exception Recorded
    Status = OK             Status = ERROR
          ↓                       ↓
    Span Ended (end time recorded, duration calculated)
          ↓
    Span Exported to Console (JSON format)
          ↓
    Console Output Visible to Developer
```

## Entity Cardinality

```
Resource (1) ←─────── Trace (*) ←─────── Span (*)
                                            ↓
                                        Attributes (*)
                                            ↓
                                        Events (*)
```

- One Resource per service instance
- Multiple Traces (one per HTTP request)
- Multiple Spans per Trace (currently 1 span per request, but extensible)
- Multiple Attributes per Span
- Zero or more Events per Span (only when errors occur)

## Validation Rules

### Trace
- `traceId` must be unique globally
- Must contain at least one span

### Span
- `spanId` must be unique within trace
- `traceId` must reference a valid trace
- `startTime` must be before `endTime`
- `duration` must equal `endTime - startTime`
- `name` must not be empty
- `kind` must be "SERVER" for HTTP endpoints
- `status.code` must be one of: "OK", "ERROR", "UNSET"
- When `status.code` is "ERROR", at least one event with name "exception" should exist

### Resource Attributes
- `service.name` must not be empty
- `service.version` must follow semver format
- `deployment.environment` must be "development" or "production"
- `host.name` must not be empty

### Span Attributes
- `http.request.method` must be valid HTTP method (GET, POST, etc.)
- `http.route` must follow route pattern format (e.g., /api/resource/[param])
- `http.response.status_code` must be valid HTTP status code (100-599)
- `instrumentation` must equal "manual"

## Console Output Format

All telemetry data will be exported to console as structured JSON. The ConsoleSpanExporter outputs each span as a complete JSON object including:

```json
{
  "traceId": "...",
  "spanId": "...",
  "parentSpanId": null,
  "name": "GET /api/albums",
  "kind": "SERVER",
  "timestamp": "2026-01-09T14:23:45.123Z",
  "duration": 111000000,
  "attributes": {
    "service.name": "observability-study",
    "service.version": "0.1.0",
    "deployment.environment": "development",
    "host.name": "macbook-pro.local",
    "http.request.method": "GET",
    "http.route": "/api/albums",
    "http.response.status_code": 200,
    "instrumentation": "manual"
  },
  "status": { "code": "OK" },
  "events": [],
  "resource": {
    "attributes": {
      "service.name": "observability-study",
      "service.version": "0.1.0",
      "deployment.environment": "development",
      "host.name": "macbook-pro.local"
    }
  }
}
```

**Note**: Duration in OpenTelemetry is represented in nanoseconds (hence the large number). Human-readable duration in milliseconds can be calculated by dividing by 1,000,000.

## Implementation Considerations

1. **No Persistence**: Telemetry data is not stored; it's exported directly to console and ephemeral
2. **Synchronous Export**: SimpleSpanProcessor exports immediately when span ends (blocking)
3. **Single Span per Request**: Current implementation creates one root span per API endpoint call
4. **No Span Nesting**: For simplicity, not creating child spans within endpoint handlers
5. **Error Propagation**: Errors are recorded in spans but re-thrown to maintain Next.js error handling
6. **Thread Safety**: Not a concern in Node.js single-threaded event loop; each request gets independent context

## Future Extensibility (Out of Scope)

While not implemented in this feature, the data model supports:
- Child spans for database queries or external API calls
- Custom events beyond exceptions
- Span links to connect related traces
- Baggage for cross-service context propagation
- Different exporters (OTLP, Jaeger, Zipkin) by swapping ConsoleSpanExporter
