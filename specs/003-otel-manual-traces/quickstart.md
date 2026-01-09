# Quickstart Guide: Manual OpenTelemetry Trace Instrumentation

**Feature**: Manual OpenTelemetry Trace Instrumentation  
**Branch**: 003-otel-manual-traces  
**Date**: January 9, 2026

## Purpose

This guide explains how to run the application with manual OpenTelemetry trace instrumentation and observe trace data in the console.

## Prerequisites

- Node.js 20+ installed
- Repository cloned
- Dependencies installed (`npm install`)
- On branch `003-otel-manual-traces`

## Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

### 2. Observe Console Output

The terminal running `npm run dev` will display trace data in JSON format for every API request.

### 3. Trigger API Requests

#### Option A: Use the Web Interface

1. Open `http://localhost:3000` in your browser
2. Navigate through the photo album pages
3. Each page load triggers API requests
4. Check your terminal for trace output

#### Option B: Use curl

```bash
# Health check
curl http://localhost:3000/api/health

# List all albums
curl http://localhost:3000/api/albums

# Get specific album
curl http://localhost:3000/api/albums/1

# Get specific photo
curl http://localhost:3000/api/photos/1
```

## What to Look For

Each API request generates a trace span logged to console in JSON format.

### Successful Request Example

When you call `GET /api/albums`, you should see output similar to:

```json
{
  "traceId": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
  "spanId": "1234567890abcdef",
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

### Key Fields to Understand

- **traceId**: Unique identifier for this request (same across all spans in a trace)
- **spanId**: Unique identifier for this operation
- **name**: Operation name (HTTP method + route)
- **timestamp**: When the operation started (ISO 8601 format)
- **duration**: How long the operation took (in nanoseconds; divide by 1,000,000 for milliseconds)
- **attributes**: Contextual information about the request
  - **http.request.method**: HTTP method (GET, POST, etc.)
  - **http.route**: Route pattern (uses [id] placeholders, not actual values)
  - **http.response.status_code**: HTTP status code
  - **instrumentation**: Always "manual" to identify manual instrumentation
  - **service.name**: Application identifier
  - **deployment.environment**: "development" or "production"
- **status**: Success or error status
- **events**: Array of events (contains exception details if error occurred)

### Error Request Example

To see error traces, request a non-existent album:

```bash
curl http://localhost:3000/api/albums/999
```

You should see output with:
- `status.code` set to "ERROR"
- `status.message` containing error description
- `events` array containing exception event with full stack trace

```json
{
  "traceId": "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
  "spanId": "fedcba0987654321",
  "name": "GET /api/albums/[id]",
  "status": {
    "code": "ERROR",
    "message": "Album not found"
  },
  "events": [
    {
      "name": "exception",
      "timestamp": "2026-01-09T14:24:10.520Z",
      "attributes": {
        "exception.type": "Error",
        "exception.message": "Album not found",
        "exception.stacktrace": "Error: Album not found\n    at GET (/app/api/albums/[id]/route.ts:15:11)\n    ..."
      }
    }
  ]
}
```

## Verifying Manual Instrumentation

To confirm that manual instrumentation is working alongside auto-instrumentation:

1. Check that `"instrumentation": "manual"` appears in the `attributes` of manual spans
2. Verify that manual span names follow the pattern `GET /api/[route]` (descriptive names)
3. Confirm that route patterns use placeholders like `/api/albums/[id]` instead of actual values
4. You may see multiple spans per request: auto-instrumentation spans + manual spans
5. Manual spans will have the custom "instrumentation": "manual" attribute to distinguish them

## Testing Different Endpoints

### Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Should show:
- `name`: "GET /api/health"
- `http.route`: "/api/health"
- `http.response.status_code`: 200

### Albums List

```bash
curl http://localhost:3000/api/albums
```

Should show:
- `name`: "GET /api/albums"
- `http.route`: "/api/albums"
- `http.response.status_code`: 200

### Album Detail

```bash
curl http://localhost:3000/api/albums/1
```

Should show:
- `name`: "GET /api/albums/[id]"
- `http.route`: "/api/albums/[id]" (note: [id] placeholder, not "1")
- `http.response.status_code`: 200

### Photo Detail

```bash
curl http://localhost:3000/api/photos/1
```

Should show:
- `name`: "GET /api/photos/[id]"
- `http.route`: "/api/photos/[id]" (note: [id] placeholder, not "1")
- `http.response.status_code`: 200

## Understanding Duration

The `duration` field is in nanoseconds. To convert to milliseconds:

```javascript
const milliseconds = duration / 1000000;
```

Example:
- `duration: 111000000` nanoseconds = 111 milliseconds

## Concurrent Requests

Try making multiple requests simultaneously:

```bash
curl http://localhost:3000/api/albums & \
curl http://localhost:3000/api/photos/1 & \
curl http://localhost:3000/api/health
```

Each request should have:
- A unique `traceId`
- A unique `spanId`
- Independent timing information

This demonstrates that traces don't interfere with each other.

## Filtering Console Output

Since the console will contain both application logs and trace data, you can filter for trace data:

```bash
npm run dev 2>&1 | grep -A 50 '"traceId"'
```

This shows trace output with context.

Alternatively, redirect output to a file for easier analysis:

```bash
npm run dev > traces.log 2>&1
```

Then view traces in the file:

```bash
cat traces.log | grep -A 50 '"traceId"'
```

## Stopping the Server

Press `Ctrl+C` in the terminal running `npm run dev`.

## Troubleshooting

### No Trace Output Appearing

**Problem**: API requests work but no trace data in console.

**Solution**:
1. Verify `instrumentation.ts` is configured with ConsoleSpanExporter
2. Check that spans are being created in API route handlers
3. Ensure spans are ended (finally block executes)

### Trace Output is Malformed

**Problem**: Console output is not valid JSON.

**Solution**:
1. Verify ConsoleSpanExporter is properly configured
2. Check for console.log statements in application code that might interfere
3. Ensure OpenTelemetry SDK version is compatible

### Spans Missing Attributes

**Problem**: Trace appears but missing HTTP attributes.

**Solution**:
1. Verify `span.setAttribute()` calls are executed before `span.end()`
2. Check that semantic convention constants are imported correctly
3. Ensure attributes are set within try block, not after span.end()

### Duplicate Traces

**Problem**: Seeing multiple traces for single request.

**Solution**:
1. Verify auto-instrumentation is removed from `instrumentation.ts`
2. Check that manual span creation isn't duplicated
3. Ensure only one span per endpoint handler

## Learning Objectives

By following this quickstart, you should understand:

1. **Trace Structure**: How traces, spans, and attributes relate
2. **Request Lifecycle**: When spans start and end
3. **Error Handling**: How exceptions are captured in traces
4. **Semantic Conventions**: Standard attribute names for HTTP operations
5. **Resource Attributes**: How to identify the service generating telemetry
6. **Console Export**: How to observe telemetry data without external tools

## Next Steps

After verifying basic functionality:

1. **Experiment**: Try different API endpoints and observe patterns
2. **Compare**: Make successful vs. error requests to see differences
3. **Analyze**: Calculate request durations, identify patterns
4. **Extend**: Consider what additional context would be valuable to capture

## Additional Resources

- **Specification**: [spec.md](./spec.md) - Complete feature requirements
- **Data Model**: [data-model.md](./data-model.md) - Telemetry data structures
- **Contract**: [contracts/telemetry-output.yaml](./contracts/telemetry-output.yaml) - JSON output schema
- **Research**: [research.md](./research.md) - Technical decisions and alternatives

## Automated Testing Scripts

To verify timing accuracy and duration measurements, use the provided test scripts in this directory.

**📖 Complete Documentation**: See [README-TESTING-SCRIPTS.md](./README-TESTING-SCRIPTS.md) for detailed usage, troubleshooting, and integration workflows.

### Quick Start

1. Start the dev server and capture trace output to a log file:

```bash
npm run dev 2>&1 | tee trace.log
```

2. In another terminal, make API requests to generate traces:

```bash
# Test all endpoints
curl -s http://localhost:3000/api/health > /dev/null
curl -s http://localhost:3000/api/albums > /dev/null
curl -s http://localhost:3000/api/albums/1 > /dev/null
curl -s http://localhost:3000/api/photos/1 > /dev/null
```

### Duration Analysis Script

Analyzes all span durations and converts from nanoseconds to milliseconds for readability:

```bash
cd specs/003-otel-manual-traces
./analyze_duration.sh ../../trace.log
```

**Output Example:**
```
=== Duration Analysis for Manual Spans ===
Log file: ../../trace.log

GET /api/health            Duration:      1879500 ns  (    1.88 ms)
GET /api/albums            Duration:      1236375 ns  (    1.24 ms)
GET /api/albums/[id]       Duration:       351583 ns  (    0.35 ms)
GET /api/photos/[id]       Duration:       263166 ns  (    0.26 ms)

=== Verification ===
✓ All durations are in nanoseconds (ns)
✓ Converting to milliseconds (ms) for readability: divide by 1,000,000
✓ Endpoints with database queries show longer durations
✓ Simple health check shows shorter duration
```

**What to verify:**
- Durations are reported in nanoseconds
- Database operations (albums, photos) show measurable processing time
- Fast operations (health check) show sub-millisecond durations
- First requests may show longer durations due to compilation overhead

### Duration Accuracy Verification Script

Verifies that recorded durations match the actual time difference between start and end timestamps:

```bash
cd specs/003-otel-manual-traces
./verify_duration_accuracy.sh ../../trace.log
```

**Output Example:**
```
=== Verifying Duration Calculation Accuracy ===
Log file: ../../trace.log

GET /api/health            Recorded:     1.88 ms  Calculated:     1.00 ms  Diff:   0.88 ms
GET /api/albums            Recorded:     1.24 ms  Calculated:     1.00 ms  Diff:   0.24 ms
GET /api/albums/[id]       Recorded:     0.35 ms  Calculated:     0.00 ms  Diff:   0.35 ms
GET /api/photos/[id]       Recorded:     0.26 ms  Calculated:     0.00 ms  Diff:   0.26 ms

Note: Small differences (<1ms) are expected due to rounding in ISO 8601 millisecond precision
```

**What to verify:**
- Recorded durations (from span.duration in nanoseconds) match calculated durations (from timestamp differences)
- Differences should be less than 1ms (due to ISO 8601 timestamps only showing millisecond precision)
- The OpenTelemetry SDK is accurately capturing timing information

### Running Tests for Continuous Verification

To continuously monitor trace output during development:

```bash
# Terminal 1: Start server with trace capture
npm run dev 2>&1 | tee -a continuous-trace.log

# Terminal 2: Make periodic requests
while true; do
  curl -s http://localhost:3000/api/albums > /dev/null
  sleep 2
done

# Terminal 3: Analyze traces periodically
watch -n 5 "cd specs/003-otel-manual-traces && ./analyze_duration.sh ../../continuous-trace.log | tail -20"
```

This setup allows you to:
- See real-time trace output in Terminal 1
- Generate continuous test traffic in Terminal 2
- Monitor duration trends in Terminal 3

### JSON Format Validation Script

Validates that all console output is valid JSON format and contains required fields.

**What it validates:**
- **T020**: Console output is valid JSON for all endpoints
- All JSON objects are parseable by standard JSON parsers (jq)
- Manual spans contain required fields: traceId, spanId, name, startTime, endTime, duration, attributes
- All four endpoints generate valid trace output

**Usage:**
```bash
# After capturing traces
cd specs/003-otel-manual-traces
./validate_json_format.sh ../../trace.log
```

**Output Example:**
```
=== OpenTelemetry Console Output JSON Validation ===
Log file: ../../trace.log

[1/3] Extracting and validating JSON objects...
Found 30 JSON objects

[2/3] JSON Format Validation Results:
  Total JSON objects: 30
  Valid JSON: 30
  Invalid JSON: 0
  ✓ All JSON objects are valid

[3/3] Manual Span Validation:
  Manual spans found: 6
  Valid manual spans: 6
  Invalid manual spans: 0
  ✓ All manual spans have required fields

[4/4] Endpoint Coverage Check:
  ✓ /api/health - found 2 span(s)
  ✓ /api/albums - found 2 span(s)
  ✓ /api/albums/[id] - found 4 span(s)
  ✓ /api/photos/[id] - found 4 span(s)

=== Summary ===
✅ T020 PASS: Console output is valid JSON format for all endpoints
```

**What to verify:**
- All JSON objects are valid (can be parsed by jq)
- Manual spans (with `"instrumentation": "manual"`) contain all required fields
- All four API endpoints generate trace output
- Zero invalid JSON objects detected

**Prerequisites:**
- `jq` must be installed: `brew install jq`

### Semantic Conventions Validation Script

Validates that all traces follow OpenTelemetry semantic conventions and industry best practices.

**What it validates:**
- **T027**: Span names follow meaningful pattern (e.g., "GET /api/albums")
- **T028**: Resource attributes use correct semantic convention keys
- **T029**: HTTP attributes match OpenTelemetry specifications
- **T030**: Span kind is set to SERVER for HTTP handlers

**Usage:**
```bash
# After capturing traces
cd specs/003-otel-manual-traces
./semantic_conventions_validation.sh ../../trace.log
```

**Output Example:**
```
======================================================================
  OpenTelemetry Semantic Conventions Validation
======================================================================

----------------------------------------------------------------------
T027: Validate Span Names Follow Meaningful Pattern
----------------------------------------------------------------------
✓ T027: Span names found
  4 unique span names

Span Names Found:
  ✓ GET /api/health
  ✓ GET /api/albums
  ✓ GET /api/albums/[id]
  ✓ GET /api/photos/[id]
✓ T027: All span names follow pattern

----------------------------------------------------------------------
T028: Validate Resource Attributes Use Semantic Convention Keys
----------------------------------------------------------------------
✓ T028: Resource attributes found
✓ T028: All required resource attributes present
  4/4 attributes found

----------------------------------------------------------------------
T029: Validate HTTP Attributes Match OpenTelemetry Specifications
----------------------------------------------------------------------
✓ T029: HTTP attributes found
✓ T029: All HTTP semantic conventions present
  3/3 HTTP attributes found
✓ T029: Custom 'instrumentation' attribute present

----------------------------------------------------------------------
T030: Validate Span Kind is Set to SERVER
----------------------------------------------------------------------
✓ T030: Span kind found
✓ T030: All manual spans use SERVER kind

======================================================================
  Validation Summary
======================================================================
Total Tests: 10
Passed: 10
Failed: 0

✓ All semantic convention validations passed!
```

**What to verify:**
- All span names use "METHOD /api/route" format
- Resource attributes include service.name, service.version, deployment.environment, host.name
- HTTP attributes use http.request.method, http.route, http.response.status_code
- All endpoint spans use SpanKind.SERVER (kind: 1)
- Custom "instrumentation": "manual" attribute is present

## Manual Verification Checklist

Use this checklist to verify the feature works correctly:

- [ ] Application starts without errors
- [ ] Console shows trace data in JSON format
- [ ] Each request generates unique traceId
- [ ] Timestamps are in ISO 8601 format with milliseconds
- [ ] Duration is calculated correctly
- [ ] HTTP method attribute is correct
- [ ] Route uses pattern (e.g., /api/albums/[id]) not actual values
- [ ] Status code matches actual response
- [ ] Resource attributes include service name, version, environment, hostname
- [ ] Custom "instrumentation": "manual" attribute is present
- [ ] Error requests include exception events with stack trace
- [ ] Concurrent requests have independent traces
- [ ] Application continues functioning normally even with instrumentation

## Support

For questions or issues:
1. Review this quickstart guide
2. Check the specification and research documents
3. Examine the telemetry output schema
4. Manually verify in browser/curl

This is a study project for learning observability concepts.
