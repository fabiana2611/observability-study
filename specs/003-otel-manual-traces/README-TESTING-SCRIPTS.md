# Testing Scripts for OpenTelemetry Manual Instrumentation

This directory contains shell scripts to verify and analyze OpenTelemetry trace output, including JSON format validation, timing accuracy, and semantic conventions compliance.

## Scripts

### 1. validate_json_format.sh

Validates that all console output is valid JSON format and contains required fields.

**Usage:**
```bash
./validate_json_format.sh <log-file>
```

**Example:**
```bash
# Start server with trace capture
npm run dev 2>&1 | tee trace.log

# In another terminal, make requests
curl http://localhost:3000/api/health
curl http://localhost:3000/api/albums

# Validate JSON format
cd specs/003-otel-manual-traces
./validate_json_format.sh ../../trace.log
```

**What it validates (T020):**
- All JSON objects are parseable by standard JSON parsers (jq)
- Manual spans contain required fields: traceId, spanId, name, startTime, endTime, duration, attributes
- All four API endpoints generate valid trace output
- Zero syntax errors or malformed JSON

**Output:**
- Count of valid vs invalid JSON objects
- Validation status for manual spans
- Endpoint coverage check
- Pass/fail summary with detailed error reporting

**Prerequisites:**
- `jq` must be installed: `brew install jq`

### 2. analyze_duration.sh

Analyzes span durations from trace output and converts nanoseconds to milliseconds for readability.

**Usage:**
```bash
./analyze_duration.sh <log-file>
```

**Example:**
```bash
# Start server with trace capture
npm run dev 2>&1 | tee trace.log

# In another terminal, make requests
curl http://localhost:3000/api/health
curl http://localhost:3000/api/albums

# Analyze durations
./analyze_duration.sh ../../trace.log
```

**Output:**
- Lists all manual span durations in nanoseconds and milliseconds
- Helps identify performance patterns across endpoints
- Shows which operations take the most time

### 3. verify_duration_accuracy.sh

Verifies that recorded span durations match calculated durations from timestamp differences.

**Usage:**
```bash
./verify_duration_accuracy.sh <log-file>
```

**Example:**
```bash
# After capturing traces
./verify_duration_accuracy.sh ../../trace.log
```

**Output:**
- Compares recorded duration (from OpenTelemetry span) with calculated duration (from start/end timestamps)
- Shows differences (should be <1ms due to ISO 8601 millisecond precision)
- Validates OpenTelemetry SDK timing accuracy

### 4. semantic_conventions_validation.sh

Validates that all traces follow OpenTelemetry semantic conventions and industry best practices.

**Usage:**
```bash
./semantic_conventions_validation.sh <log-file>
```

**Example:**
```bash
# After capturing traces
./semantic_conventions_validation.sh ../../trace.log
```

**What it validates:**
- **T027**: Span names follow meaningful pattern (e.g., "GET /api/albums")
- **T028**: Resource attributes use correct semantic convention keys (service.name, service.version, etc.)
- **T029**: HTTP attributes match OpenTelemetry specifications (http.request.method, http.route, http.response.status_code)
- **T030**: Span kind is set to SERVER for all HTTP endpoint handlers

**Output:**
- Detailed validation report for each semantic convention check
- Pass/fail status with specific findings
- Summary of total tests passed vs failed
- Actionable recommendations for fixing failures

## Quick Test Workflow

1. **Capture traces:**
   ```bash
   cd ../../  # Go to project root
   npm run dev 2>&1 | tee trace.log
   ```

2. **Generate traffic** (in another terminal):
   ```bash
   for i in {1..5}; do
     curl -s http://localhost:3000/api/health > /dev/null
     curl -s http://localhost:3000/api/albums > /dev/null
     curl -s http://localhost:3000/api/albums/1 > /dev/null
     curl -s http://localhost:3000/api/photos/1 > /dev/null
     sleep 0.5
   done
   ```

3. **Analyze results** (in another terminal):
   ```bash
   cd specs/003-otel-manual-traces
   ./validate_json_format.sh ../../trace.log
   ./analyze_duration.sh ../../trace.log
   ./verify_duration_accuracy.sh ../../trace.log
   ./semantic_conventions_validation.sh ../../trace.log
   ```

## What to Look For

### validate_json_format.sh

✅ **Good Signs:**
- All JSON objects are valid (can be parsed by jq)
- 100% of manual spans contain required fields
- All four endpoints generate trace output
- Zero invalid JSON objects

❌ **Warning Signs:**
- Invalid JSON syntax errors
- Manual spans missing required fields (traceId, spanId, etc.)
- Missing endpoints (not all 4 endpoints generating traces)
- Malformed console output (mixed with other logs)

### analyze_duration.sh

✅ **Good Signs:**
- Health endpoint: <5ms (fast, minimal processing)
- Albums list: 1-50ms (database query)
- Album detail: 1-100ms (parameterized query)
- Photo detail: 1-100ms (complex query)
- First requests may be slower due to compilation

❌ **Warning Signs:**
- All durations >500ms (potential performance issue)
- Inconsistent durations for same endpoint (caching issues)
- No variation between endpoints (instrumentation not working)

### verify_duration_accuracy.sh

✅ **Good Signs:**
- Differences <1ms between recorded and calculated
- Consistent accuracy across all endpoints
- No systematic over/under reporting

❌ **Warning Signs:**
- Differences >10ms (timing calculation error)
- Negative durations (clock sync issue)
- All zeros (span timing not captured)

### semantic_conventions_validation.sh

✅ **Good Signs:**
- All span names follow "METHOD /api/route" pattern
- All 4 required resource attributes present (service.name, service.version, deployment.environment, host.name)
- All 3 HTTP attributes present (http.request.method, http.route, http.response.status_code)
- All spans have kind: 1 (SERVER)
- Custom "instrumentation": "manual" attribute found

❌ **Warning Signs:**
- Span names don't follow pattern (missing method, wrong format)
- Missing required resource attributes
- Missing HTTP semantic convention attributes
- Wrong span kind (0=INTERNAL, 2=CLIENT, etc.)
- No "instrumentation": "manual" attribute in manual spans

## Troubleshooting

### "Error: Log file not found"

Make sure you're providing the correct path to the trace log file:
```bash
./analyze_duration.sh /path/to/trace.log
```

### No output / "No matches found"

The log file doesn't contain trace data. Verify:
1. Server is running with trace output enabled
2. API requests were made after starting the server
3. Log file actually contains JSON trace output

### Script permission denied

Make scripts executable:
```bash
chmod +x *.sh
```

## Integration with Development Workflow

### During Feature Development

```bash
# Terminal 1: Dev server with traces
npm run dev 2>&1 | tee dev-traces.log

# Terminal 2: Your development work
# Make code changes, test manually

# Terminal 3: Continuous duration monitoring
watch -n 5 "./specs/003-otel-manual-traces/analyze_duration.sh dev-traces.log | tail -20"
```

### Before Committing Changes

```bash
# Capture clean trace set
npm run dev 2>&1 > clean-traces.log &
sleep 5

# Test all endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/albums  
curl http://localhost:3000/api/albums/1
curl http://localhost:3000/api/photos/1

# Verify timing accuracy
cd specs/003-otel-manual-traces
./analyze_duration.sh ../../clean-traces.log
./verify_duration_accuracy.sh ../../clean-traces.log

# Stop server
pkill -f "next dev"
```

## Notes

- Scripts use `awk` and standard Unix tools (grep, sed, date)
- macOS-specific date parsing (uses `date -j -f`)
- Filters for manual spans only (containing "GET /api/")
- Assumes ISO 8601 timestamp format in trace output
- Default log path: `/tmp/nextjs-duration-test.log`

## See Also

- [quickstart.md](./quickstart.md) - Complete feature testing guide
- [spec.md](./spec.md) - Feature requirements and user stories
- [contracts/telemetry-output.yaml](./contracts/telemetry-output.yaml) - Trace output schema
