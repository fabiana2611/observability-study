# Research: Manual OpenTelemetry Trace Instrumentation

**Feature**: Manual OpenTelemetry Trace Instrumentation  
**Branch**: 003-otel-manual-traces  
**Date**: January 9, 2026

## Overview

This document consolidates research findings for implementing manual OpenTelemetry trace instrumentation in a Next.js application with console export for educational purposes.

## Research Questions & Findings

### 1. OpenTelemetry Manual Instrumentation Approach

**Question**: How do we implement manual span creation in Next.js API routes?

**Decision**: Use @opentelemetry/api package for manual span creation with tracer from SDK

**Rationale**:
- OpenTelemetry provides separation between API (for instrumentation) and SDK (for implementation)
- Manual instrumentation gives full control over span lifecycle
- Tracer obtained from TracerProvider creates and manages spans
- Spans wrap async operations with start/end timing

**Implementation Pattern**:
```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('service-name', 'version');

export async function GET(request: Request) {
  const span = tracer.startSpan('operation-name');
  try {
    // Business logic
    span.setStatus({ code: SpanStatusCode.OK });
    return response;
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

**Alternatives Considered**:
- Auto-instrumentation only: Rejected because spec requires manual instrumentation for learning purposes, but auto-instrumentation will co-exist
- Middleware-based instrumentation: Rejected because spec requires instrumentation directly in endpoint code

**Note**: Auto-instrumentation and manual instrumentation will co-exist in this implementation

### 2. Console Exporter Configuration

**Question**: How do we export OpenTelemetry traces to console in JSON format?

**Decision**: Use @opentelemetry/sdk-trace-base ConsoleSpanExporter with custom JSON formatting

**Rationale**:
- ConsoleSpanExporter is built-in to OpenTelemetry SDK
- Outputs to stdout (console.log)
- Can be configured with SimpleSpanProcessor for immediate export
- JSON format achieved by ensuring exporter outputs structured data

**Configuration**:
```typescript
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'observability-study',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    [SemanticResourceAttributes.HOST_NAME]: require('os').hostname(),
  }),
});

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();
```

**Alternatives Considered**:
- Custom console.log formatting: Rejected because ConsoleSpanExporter provides standard format
- OTLP exporter: Rejected because spec requires console-only output for study purposes
- File exporter: Rejected because spec explicitly requires console output

### 3. OpenTelemetry Semantic Conventions

**Question**: What are the standard semantic conventions for HTTP spans?

**Decision**: Use @opentelemetry/semantic-conventions package for attribute naming

**Rationale**:
- Semantic conventions ensure compatibility with observability tools
- Provides educational value by teaching industry standards
- Predefined constants prevent typos and ensure consistency

**Key HTTP Semantic Conventions**:
```typescript
import { ATTR_HTTP_REQUEST_METHOD, ATTR_HTTP_RESPONSE_STATUS_CODE, ATTR_HTTP_ROUTE } from '@opentelemetry/semantic-conventions';

span.setAttribute(ATTR_HTTP_REQUEST_METHOD, request.method);
span.setAttribute(ATTR_HTTP_ROUTE, '/api/albums/[id]');
span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, response.status);
span.setAttribute('instrumentation', 'manual'); // Custom attribute
```

**Standard Attributes to Include**:
- `http.request.method`: HTTP method (GET, POST, etc.)
- `http.route`: Route pattern (not specific parameter values)
- `http.response.status_code`: HTTP status code
- `instrumentation`: Custom attribute set to "manual" per user requirement

**Alternatives Considered**:
- Custom attribute names: Rejected because semantic conventions provide industry standards
- Old semantic conventions (http.method): Rejected because newer conventions are more precise

### 4. Resource Attributes for Application Identification

**Question**: What resource attributes should identify the application?

**Decision**: Include service.name, service.version, deployment.environment, and host.name

**Rationale**:
- These are standard OpenTelemetry resource attributes from semantic conventions
- Provide complete identification of telemetry source
- User explicitly requested: service name, version, environment, and hostname

**Resource Attribute Implementation**:
```typescript
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION, ATTR_DEPLOYMENT_ENVIRONMENT, ATTR_HOST_NAME } from '@opentelemetry/semantic-conventions';
import { hostname } from 'os';

const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'observability-study',
  [ATTR_SERVICE_VERSION]: '0.1.0',
  [ATTR_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  [ATTR_HOST_NAME]: hostname(),
});
```

**Alternatives Considered**:
- Minimal attributes (name only): Rejected because user requested comprehensive identification
- Additional attributes (process ID, container ID): Rejected to avoid unnecessary complexity in study project

### 5. Error Handling and Stack Traces

**Question**: How should errors be captured in spans with full stack traces?

**Decision**: Use span.recordException() and span.setStatus() for error handling

**Rationale**:
- recordException() captures error with stack trace automatically
- setStatus() marks span as error for proper status reporting
- Following OpenTelemetry best practices for exception recording

**Error Handling Pattern**:
```typescript
try {
  // Operation
  span.setStatus({ code: SpanStatusCode.OK });
} catch (error) {
  span.setStatus({ 
    code: SpanStatusCode.ERROR,
    message: error instanceof Error ? error.message : 'Unknown error'
  });
  span.recordException(error instanceof Error ? error : new Error(String(error)));
  throw error; // Re-throw to maintain Next.js error handling
} finally {
  span.end();
}
```

**Alternatives Considered**:
- Manual stack trace formatting: Rejected because recordException() provides standard formatting
- Swallowing errors: Rejected because errors must propagate for proper Next.js error handling

### 6. Timestamp Format

**Question**: How should timestamps be formatted in console output?

**Decision**: ISO 8601 format with milliseconds (handled automatically by OpenTelemetry)

**Rationale**:
- OpenTelemetry SDK uses high-resolution timestamps internally
- ConsoleSpanExporter outputs timestamps in standard format
- ISO 8601 is the default format for telemetry data

**Implementation**: No custom formatting needed; OpenTelemetry SDK handles this automatically.

### 7. Dynamic Route Parameters

**Question**: How should dynamic route parameters be logged?

**Decision**: Use route pattern (e.g., /api/albums/[id]) not actual values

**Rationale**:
- Maintains consistency across requests
- Prevents high cardinality in span names
- Follows OpenTelemetry best practices for HTTP route attributes
- User clarified no sensitive data filtering needed, so using pattern for consistency only

**Implementation**:
```typescript
// In /api/albums/[id]/route.ts
span.setAttribute(ATTR_HTTP_ROUTE, '/api/albums/[id]');
// NOT: span.setAttribute(ATTR_HTTP_ROUTE, `/api/albums/${id}`);
```

### 8. Trace and Span ID Generation

**Question**: Are trace IDs and span IDs generated automatically?

**Decision**: Yes, OpenTelemetry SDK generates unique IDs automatically

**Rationale**:
- TracerProvider creates context with unique trace ID for each request
- Each span gets unique span ID
- No manual ID management required

**Implementation**: No action needed; handled by OpenTelemetry SDK.

## Technology Decisions Summary

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| @opentelemetry/api | ^1.9.0 (peer dep) | Manual span creation | Standard API for instrumentation |
| @opentelemetry/sdk-trace-node | ^1.31.0 | Tracer provider | Node.js tracing implementation |
| @opentelemetry/sdk-trace-base | ^1.31.0 | Console exporter | Built-in console export |
| @opentelemetry/resources | ^1.31.0 | Resource attributes | Service identification |
| @opentelemetry/semantic-conventions | ^1.31.0 | Standard attribute names | Industry standard conventions |

**Note**: Exact versions will be determined by @opentelemetry/sdk-node ^0.208.0 already installed, which bundles these packages.

## Dependencies

### Required (Already Installed)
- @opentelemetry/sdk-node: ^0.208.0

### May Need to Add
- @opentelemetry/api: (peer dependency, may need explicit install)
- @opentelemetry/resources: (may be bundled, verify)
- @opentelemetry/semantic-conventions: (may be bundled, verify)

### Not Needed
- @opentelemetry/auto-instrumentations-node: Will be removed (switching from auto to manual)

## Best Practices

1. **Span Lifecycle**: Always end spans in finally block to ensure cleanup
2. **Error Recording**: Use recordException() for full stack traces
3. **Status Codes**: Set OK status explicitly on success, ERROR on failure
4. **Attribute Naming**: Use semantic convention constants, not string literals
5. **Route Patterns**: Use route templates, not actual parameter values
6. **Resource Attributes**: Set once at provider initialization, not per span
7. **Custom Attributes**: Add "instrumentation": "manual" to distinguish from auto-instrumentation

## Manual Verification Plan

Since this is a study project with Zero Testing Policy, verification will be manual:

1. Start application with `npm run dev`
2. Make requests to each endpoint:
   - GET /api/health
   - GET /api/albums
   - GET /api/albums/1
   - GET /api/photos/1
3. Verify console output for each request contains:
   - Trace ID and Span ID
   - Operation name
   - Start/end timestamps in ISO 8601 format
   - Duration
   - HTTP attributes (method, route, status code)
   - Resource attributes (service name, version, environment, hostname)
   - Custom "instrumentation": "manual" attribute
4. Trigger error case (invalid album ID) and verify:
   - Error status in span
   - Full stack trace captured
   - Span still completes properly
5. Make concurrent requests and verify:
   - Each has unique trace ID
   - Spans don't interfere with each other

## Next Steps

Proceed to Phase 1:
- Create data-model.md (telemetry data structures)
- Create contracts/telemetry-output.yaml (JSON console output schema)
- Create quickstart.md (how to run and observe traces)
