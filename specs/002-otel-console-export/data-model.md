# Data Model: Default OpenTelemetry OTLP Format

**Phase**: 1 (Design & Contracts)  
**Date**: January 7, 2026  
**Plan**: [plan.md](plan.md)

## Overview

This document describes the **default OpenTelemetry OTLP (OpenTelemetry Protocol) JSON format** as exported by the OpenTelemetry SDK to console. This is the out-of-the-box format with NO customization - exactly what you'll see in the terminal for study purposes.

**Study Approach**: Document default SDK behavior, not custom structures.

## Default OTLP Span Structure

The OpenTelemetry SDK exports spans to console using the ReadableSpan format. Here's what appears in console output:

```json
{
  "traceId": "7c3a8f2b1e4d9c6a5b8f3e2a1d7c4b9a",
  "parentId": "a1b2c3d4e5f6g7h8",
  "traceState": undefined,
  "name": "GET /api/albums",
  "id": "1234567890abcdef",
  "kind": 2,
  "timestamp": 1736294400000000,
  "duration": 125000,
  "attributes": {
    "http.method": "GET",
    "http.url": "http://localhost:3000/api/albums",
    "http.target": "/api/albums",
    "http.status_code": 200,
    "http.route": "/api/albums"
  },
  "status": {
    "code": 1
  },
  "events": [],
  "links": []
}
```

### Key Format Characteristics

**Timestamps**: Microseconds since Unix epoch (integer)
- Example: `1736294400000000` = 1,736,294,400 seconds (Jan 7, 2026) * 1,000,000

**Span Kind**: Integer enum (not human-readable strings)
- `0` = INTERNAL
- `1` = SERVER
- `2` = CLIENT
- `3` = PRODUCER
- `4` = CONSUMER

**Status Code**: Integer enum
- `0` = UNSET
- `1` = OK
- `2` = ERROR

**Duration**: Microseconds (integer)
- Example: `125000` = 125ms

**IDs**: Hex strings without dashes
- traceId: 32 characters (128-bit)
- spanId (as "id"): 16 characters (64-bit)

## Resource Attributes

Every span includes resource attributes describing the service:

```json
{
  "resource": {
    "attributes": {
      "service.name": "unknown_service:node",
      "telemetry.sdk.language": "nodejs",
      "telemetry.sdk.name": "opentelemetry",
      "telemetry.sdk.version": "1.29.0",
      "process.pid": 12345,
      "process.executable.name": "node",
      "process.runtime.name": "nodejs",
      "process.runtime.version": "20.10.0",
      "host.name": "Fabianas-MacBook-Pro.local",
      "host.arch": "arm64"
    }
  }
}
```

**Configuration via environment**:
- `OTEL_SERVICE_NAME` overrides default "unknown_service:node"
- `OTEL_RESOURCE_ATTRIBUTES` adds additional key-value pairs

## HTTP Span Attributes

Auto-instrumentation adds these attributes for HTTP operations:

**Server-side (API Routes, Pages)**:
```json
{
  "http.method": "GET",
  "http.url": "http://localhost:3000/api/albums",
  "http.target": "/api/albums",
  "http.host": "localhost:3000",
  "http.scheme": "http",
  "http.status_code": 200,
  "http.route": "/api/albums",
  "http.user_agent": "Mozilla/5.0..."
}
```

**Client-side (Fetch calls)**:
```json
{
  "http.method": "GET",
  "http.url": "https://external-api.com/data",
  "http.status_code": 200,
  "net.peer.name": "external-api.com",
  "net.peer.port": 443
}
```

## Database Span Attributes

SQLite instrumentation adds these attributes:

```json
{
  "db.system": "sqlite",
  "db.name": "photos.db",
  "db.statement": "SELECT * FROM albums WHERE id = ?",
  "db.operation": "SELECT"
}
```

**Sensitive Data Filtering**: 
- SDK automatically excludes `Authorization` header values
- No custom filtering implemented (zero-code approach)
- PII in query parameters will appear in output (study mode trade-off)

## Span Hierarchy

Spans maintain parent-child relationships via `parentId`:

```
Root Span (parentId: undefined)
├─ Child Span 1 (parentId: root.id)
│  └─ Grandchild Span (parentId: child1.id)
└─ Child Span 2 (parentId: root.id)
```

**Trace Visualization**:
- All spans share same `traceId`
- `parentId` links child to parent
- Root span has `parentId: undefined`
- Duration cascade: parent >= sum of children (includes gaps)

## Console Output Format

SDK writes spans to console as newline-delimited JSON (NDJSON):

```
{span1 JSON...}
{span2 JSON...}
{span3 JSON...}
```

**Characteristics**:
- One span per line
- No pretty-printing (compact JSON)
- Spans exported in completion order (not hierarchical order)
- Verbose output (~50-100 lines per HTTP request with full resource attributes)

## Data Volume

**Per HTTP Request** (3-layer application: page → API → database):
- 4-6 spans generated
- ~200-400 lines of console output
- Resource attributes repeated on every span
- Full attribute set on each span (no attribute deduplication)

**Study Mode Trade-offs**:
- ✅ Authentic OpenTelemetry experience
- ✅ Standard-compliant OTLP format
- ✅ Zero code maintenance
- ❌ Not human-readable without tooling
- ❌ High verbosity
- ❌ Manual correlation required

## Differences from Production Exporters

Default console exporter differs from production backends (Jaeger, Zipkin, etc.):

| Feature | Console Exporter | Production Exporter |
|---------|------------------|---------------------|
| Format | NDJSON | OTLP binary/protobuf |
| Timestamps | Microseconds | Nanoseconds |
| Batching | None (immediate) | Batched |
| Compression | None | gzip/zstd |
| Sampling | 100% | Configurable |
| Storage | stdout | Backend database |
| Visualization | Manual | UI/dashboards |

## Entity Relationships

```
Trace (traceId)
  └─ Spans (1:N)
       ├─ Attributes (1:N key-value pairs)
       ├─ Events (1:N timestamped logs)
       ├─ Links (1:N span references)
       └─ Status (1:1 outcome indicator)
```

## Validation Rules

SDK enforces these constraints:

1. **Trace Context**: `traceId` must be consistent across span hierarchy
2. **Temporal**: `timestamp + duration` determines end time
3. **Parent-Child**: `parentId` must reference existing span in same trace (or undefined for root)
4. **Status**: If status.code = ERROR, error event should exist in events array
5. **Kinds**: SERVER spans typically are root spans (no parentId)

## Example: Full Request Trace

User navigates to `/album/5`, triggers this span sequence:

```json
// Span 1: Incoming HTTP request
{"traceId":"abc123","id":"span1","name":"GET /album/5","kind":1,"timestamp":1000000,"duration":150000,"attributes":{"http.method":"GET","http.route":"/album/[id]"},"parentId":undefined}

// Span 2: Server Component render
{"traceId":"abc123","id":"span2","name":"next.renderServerComponent","kind":0,"timestamp":1005000,"duration":120000,"attributes":{"next.route":"/album/[id]"},"parentId":"span1"}

// Span 3: Fetch album data
{"traceId":"abc123","id":"span3","name":"GET /api/albums/5","kind":2,"timestamp":1010000,"duration":45000,"attributes":{"http.method":"GET","http.url":"http://localhost:3000/api/albums/5"},"parentId":"span2"}

// Span 4: Database query
{"traceId":"abc123","id":"span4","name":"SELECT albums","kind":0,"timestamp":1015000,"duration":12000,"attributes":{"db.system":"sqlite","db.statement":"SELECT * FROM albums WHERE id = ?"},"parentId":"span3"}
```

**Total Console Output**: ~800 lines (4 spans × ~200 lines each with full resource attributes)

## Configuration Reference

All configuration via environment variables:

```bash
# Basic
OTEL_SDK_DISABLED=false
OTEL_SERVICE_NAME=photo-album-app

# Tracing
OTEL_TRACES_EXPORTER=console
OTEL_EXPORTER_OTLP_PROTOCOL=console

# Resource
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=study,service.version=1.0.0

# Sampling (100% = always on)
OTEL_TRACES_SAMPLER=always_on
```

No code-based configuration exists in the zero-code study approach.

**Purpose**: Flexible key-value metadata attached to spans, following OpenTelemetry semantic conventions.

**Structure**: `Record<string, string | number | boolean>`

**Standard Attribute Categories**:

#### HTTP Attributes (API Routes, Page Requests)
- `http.method`: Request method (GET, POST, etc.)
- `http.url`: Full request URL
- `http.target`: Request path (e.g., "/api/albums/5")
- `http.status_code`: Response status (200, 404, 500, etc.)
- `http.route`: Route pattern (e.g., "/api/albums/[id]")
- `http.user_agent`: Client user agent

#### Database Attributes (SQLite Queries)
- `db.system`: "sqlite"
- `db.name`: Database file name
- `db.statement`: SQL query (SELECT, INSERT, etc.) - may be redacted if contains sensitive data
- `db.operation`: Operation type (SELECT, INSERT, UPDATE, DELETE)

#### Next.js Attributes (Custom)
- `next.route`: Next.js route path
- `next.page`: Page component name
- `next.render_type`: "SSR" | "SSG" | "ISR"

#### Error Attributes (when status = ERROR)
- `error`: true
- `error.type`: Exception class name
- `error.message`: Error message
- `error.stack`: Stack trace (first 10 lines)

**SDK Default Filtering** (zero-code study approach):
- FILTERED: `http.request.header.authorization` (SDK default)
- NOT FILTERED: Cookies, emails, tokens, API keys, user IDs in other locations
- Study Note: Production applications should implement custom filtering

---

### 4. SpanEvent

**Purpose**: Timestamped log entry within a span (e.g., exceptions, state changes).

**Attributes**:
- `time` (timestamp, ISO 8601): When the event occurred
- `name` (string): Event type (e.g., "exception", "log", "annotation")
- `attributes` (object): Event-specific key-value pairs
  - For exceptions: `exception.type`, `exception.message`, `exception.stacktrace`
  - For logs: `log.level`, `log.message`

**Example Events**:
```typescript
{
  time: "2026-01-07T10:30:45.500Z",
  name: "exception",
  attributes: {
    "exception.type": "NotFoundError",
    "exception.message": "Album ID 999 not found",
    "exception.stacktrace": "Error: Album...\n  at getAlbum (lib/db.ts:45)"
  }
}
```

**Usage**:
- Automatically created by OpenTelemetry auto-instrumentation when exceptions occur
- Can be manually added for debug logging (not in zero-code implementation)

---

### 5. Resource

**Purpose**: Describes the service/application generating telemetry data.

**Default SDK Attributes**:
- `service.name`: "observability-study" (from OTEL_SERVICE_NAME env var)
- `service.version`: "0.1.0" (from OTEL_RESOURCE_ATTRIBUTES env var)
- `deployment.environment`: "development" (from OTEL_RESOURCE_ATTRIBUTES env var)
- `telemetry.sdk.name`: "opentelemetry"
- `telemetry.sdk.language`: "nodejs"
- `telemetry.sdk.version`: Auto-detected from SDK package
- `process.pid`: Node.js process ID
- `host.name`: OS hostname
- `host.arch`: CPU architecture
- `process.pid`: Node.js process ID
- `process.runtime.name`: "nodejs"
- `process.runtime.version`: Node.js version (e.g., "v20.10.0")

**Lifecycle**: 
- Created once during SDK initialization in `instrumentation.node.ts`
- Attached to all exported spans as context

---

## Data Flow

```
User Request → Next.js Server
                    ↓
    [OpenTelemetry Auto-Instrumentation]
                    ↓
         Create Root Span (HTTP request)
                    ↓
    Execute Server Component / API Route
                    ↓
    Child Spans: Database queries, fetch calls
                    ↓
         Complete Root Span
                    ↓
    [Span Processor: Filter sensitive data]
                    ↓
    [Console Exporter: Format as JSON]
                    ↓
            stdout/stderr
```

## Console Output Schema

**Format**: One JSON object per span, printed to console on span completion

**Fields Exported**:
```typescript
{
  timestamp: string;        // Span end time (ISO 8601)
  traceId: string;         // Trace UUID
  spanId: string;          // Span ID (16-char hex)
  parentSpanId?: string;   // Parent span ID (omitted if root)
  name: string;            // Operation name
  kind: string;            // Span kind (SERVER, INTERNAL, CLIENT)
  status: string;          // OK | ERROR
  duration: string;        // Human-readable (e.g., "45ms")
  attributes: Record<string, any>;  // Filtered attributes
  events?: Array<{...}>;   // Span events (only if present)
  resource: {              // Service metadata
    "service.name": string;
    "service.version": string;
  }
}
```

**Example Console Output**:
```json
{
  "timestamp": "2026-01-07T10:30:45.145Z",
  "traceId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "spanId": "1234567890abcdef",
  "parentSpanId": null,
  "name": "GET /api/albums/5",
  "kind": "SERVER",
  "status": "OK",
  "duration": "45ms",
  "attributes": {
    "http.method": "GET",
    "http.url": "/api/albums/5",
    "http.status_code": 200,
    "http.route": "/api/albums/[id]"
  },
  "resource": {
    "service.name": "observability-study",
    "service.version": "0.1.0"
  }
}
```

## Validation & Testing

**Manual Verification Steps** (per Zero Testing Policy):
1. Start application: `npm run dev`
2. Navigate to album page: `http://localhost:3000/album/1`
3. Inspect console output for span JSON objects
4. Verify required fields present: traceId, spanId, name, duration, status
5. Verify parent-child relationships: Child spans reference parent via `parentSpanId`
6. Verify sensitive data redacted: No authorization headers, emails, or tokens visible
7. Verify trace correlation: All spans for same request share same `traceId`

**Expected Span Count** (for viewing album #1):
- 1x SERVER span: GET /album/1 (page request)
- 1x CLIENT span: GET /api/albums/1 (fetch album data)
- 1x INTERNAL span: db.query (fetch album from SQLite)
- 1x CLIENT span: GET /api/photos?albumId=1 (fetch photos)
- 1x INTERNAL span: db.query (fetch photos from SQLite)
- **Total: ~5 spans** with 1 shared traceId

## Next Steps

**Phase 1 Continuation**:
- Create console output contract schema (contracts/telemetry-output.yaml)
- Document developer quickstart guide (quickstart.md)
- Update agent context with OpenTelemetry knowledge
