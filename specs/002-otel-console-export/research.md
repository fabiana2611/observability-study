# Research: Zero-Code OpenTelemetry Observability (Pure Study Approach)

**Phase**: 0 (Research & Discovery)  
**Date**: January 7, 2026  
**Plan**: [plan.md](plan.md)

## Research Objective

**Study Goal**: Observe default OpenTelemetry behavior with ZERO custom code. This is a learning exercise to understand what OpenTelemetry provides out-of-the-box without any customization layers.

## Research Tasks

This document resolves all "NEEDS CLARIFICATION" markers from the Technical Context and evaluates the minimal configuration needed for pure zero-code instrumentation.

## 1. OpenTelemetry Package Selection for TRUE Zero-Code

### Decision: Absolute Minimal Package Set

**Packages Required** (2 packages only):
1. `@opentelemetry/sdk-node` - Core SDK with default console exporter
2. `@opentelemetry/auto-instrumentations-node` - Automatic instrumentation for Node.js

**Rationale**:
- **Study purpose**: Observe default OpenTelemetry behavior without customization
- **Zero custom code**: SDK provides default console exporter built-in (no custom exporters needed)
- **Auto-instrumentation**: Patches HTTP, fetch, and database libraries automatically
- **Environment-driven**: All configuration via `OTEL_*` environment variables (no code files)

**What's REMOVED from original plan**:
- ❌ `@opentelemetry/sdk-trace-node` - included in sdk-node
- ❌ `@opentelemetry/resources` - included in sdk-node  
- ❌ `@opentelemetry/semantic-conventions` - not needed for basic usage
- ❌ `@opentelemetry/exporter-trace-otlp-proto` - using default console exporter
- ❌ Custom `instrumentation.node.ts` file - using SDK defaults
- ❌ Custom filtering/formatting code - accepting SDK defaults

**Setup Approach**:
```bash
# Install packages
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node

# Create minimal instrumentation.ts (5 lines)
# Configure via environment variables in .env.local
# No other code files needed
```

**Alternatives Considered**:
- Custom instrumentation files - REJECTED: Violates "no code to manage" constraint for study
- Manual span creation - REJECTED: Not zero-code
- Custom exporters/formatters - REJECTED: Adds code complexity, defeats study purpose

### 2. Console Output Format - Default OpenTelemetry

**Decision**: Accept Default SDK Console Output (No Customization)

**Format**: Whatever OpenTelemetry SDK outputs by default
- Verbose JSON with all OpenTelemetry protocol fields
- Not human-optimized, but complete and standard-compliant
- Includes all resource attributes, instrumentation scope, etc.

**Example Default Output** (from OpenTelemetry SDK):
```json
{
  "traceId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "id": "1234567890abcdef",
  "parentId": "fedcba0987654321",
  "name": "GET /api/albums",
  "kind": 1,
  "timestamp": 1704628245145000,
  "duration": 45231,
  "attributes": {
    "http.method": "GET",
    "http.target": "/api/albums",
    "http.status_code": 200
  },
  "status": {"code": 0},
  "events": [],
  "links": [],
  "resource": {
    "attributes": {
      "service.name": "unknown_service:node",
      "telemetry.sdk.name": "opentelemetry",
      "telemetry.sdk.language": "nodejs",
      "telemetry.sdk.version": "1.x.x"
    }
  },
  "instrumentationScope": {
    "name": "@opentelemetry/instrumentation-http",
    "version": "0.x.x"
  }
}
```

**Rationale**:
- **Study purpose**: Learn what OpenTelemetry provides by default
- **No customization**: No code to format, filter, or process output
- **Standard compliant**: Output follows OpenTelemetry protocol spec exactly

**Tradeoffs Accepted**:
- ✅ Zero custom code to maintain
- ✅ Pure OpenTelemetry behavior observation
- ❌ Output is verbose and not optimized for quick scanning
- ❌ Timestamps are microseconds since epoch (not ISO 8601)
- ❌ `kind` is integer enum (not string like "SERVER")

**Alternatives Considered**:
- Custom console formatter - REJECTED: Adds code to manage
- Pretty-printing library - REJECTED: Additional dependency
- JSON.stringify wrapper - REJECTED: Still custom code

### 3. Configuration Strategy - Environment Variables Only

**Decision**: Zero Code Files, Pure Environment Variable Configuration

**Required Environment Variables** (`.env.local`):
```bash
# Enable OpenTelemetry SDK
OTEL_SDK_DISABLED=false

# Service identification
OTEL_SERVICE_NAME=observability-study

# Exporter configuration (console is default, but explicit for clarity)
OTEL_TRACES_EXPORTER=console
OTEL_LOGS_EXPORTER=console

# Sampling (100% for study)
OTEL_TRACES_SAMPLER=always_on

# Optional: Resource attributes
OTEL_RESOURCE_ATTRIBUTES=service.version=0.1.0,deployment.environment=development
```

**Minimal instrumentation.ts** (ONLY file needed):
```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');
    
    const sdk = new NodeSDK({
      instrumentations: [getNodeAutoInstrumentations()],
    });
    
    sdk.start();
  }
}
```

**That's it!** No other code files. All configuration via environment variables.

**Rationale**:
- **Minimal code surface**: Only 12 lines of barebone initialization
- **No logic to maintain**: Just import and start SDK
- **Environment-driven**: Easy to change behavior without editing code
- **OpenTelemetry standard**: OTEL_* variables are the recommended approach

**What's NOT needed**:
- ❌ Custom Resource configuration code
- ❌ Custom exporter instantiation
- ❌ Custom processor or sampler code
- ❌ Service name/version in code
- ❌ Filtering or formatting logic

### 4. Sensitive Data Filtering - SDK Defaults Only

**Decision**: Rely on OpenTelemetry SDK Default Behavior

**Default SDK Filtering** (built-in, no code needed):
- HTTP instrumentation automatically excludes `Authorization` header by default
- No other filtering applied (raw telemetry data)

**Study Approach**:
- SDK only filters Authorization header by default
- Other sensitive data (cookies, emails, user IDs, tokens) may appear in output
- This is acceptable for study/development environment (not production)
- Demonstrates what developers get with zero-code approach
- Documents the need for custom filtering in production applications

**If sensitive data appears**: Document it as a learning finding

**Alternatives Considered**:
- Custom SpanProcessor with filtering - REJECTED: Violates zero-code study goal
- Environment variable patterns - REJECTED: Not supported by SDK
- Third-party filtering library - REJECTED: Additional dependency

### 5. Performance Budget Validation

**Decision**: No Special Handling, Observe Defaults

**Approach**:
- OpenTelemetry SDK overhead: ~1-3% typically
- Default console exporter: Synchronous, minimal overhead
- 100% sampling: Acceptable for study (not production)

**No custom throttling or optimization**: Study goal is to observe default behavior

**Validation** (Manual):
1. Measure baseline response times without OpenTelemetry
2. Enable OpenTelemetry with default configuration
3. Compare response times
4. Document overhead percentage

**Expected Outcome**: Should meet SC-006 (<5%) with default SDK configuration

### 6. Next.js Server Component Coverage

**Decision**: HTTP-Level Auto-Instrumentation (Unchanged)

**How it works**:
- OpenTelemetry auto-instrumentation captures HTTP requests
- Server Components render during request lifecycle → automatically included in HTTP span
- Database queries auto-instrumented via better-sqlite3 detection

**Coverage** (same as before):
- ✅ API routes: HTTP requests
- ✅ Server Components: Part of HTTP request span
- ✅ Database queries: Automatic instrumentation
- ❌ Client Components: Out of scope

**No code needed**: Auto-instrumentation handles everything

## Summary of Zero-Code Approach

| Aspect | Original Plan | Zero-Code Study Approach |
|--------|--------------|--------------------------|
| **Package Count** | 5+ packages | 2 packages only |
| **Code Files** | 2 files (~80 lines) | 1 file (~12 lines) |
| **Configuration** | Code-based | Environment variables |
| **Console Format** | Custom formatted JSON | Default OTLP JSON |
| **Sensitive Filtering** | Custom SpanProcessor | SDK defaults only |
| **Maintainability** | Medium (custom logic) | Minimal (just imports) |
| **Study Value** | Learn customization | Learn defaults |

## Key Decisions Summary

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Package Selection** | 2 packages: sdk-node + auto-instrumentations-node | Minimal for zero-code auto-instrumentation |
| **Code Files** | 1 file: instrumentation.ts (12 lines) | Next.js requirement, but no custom logic |
| **Configuration** | Environment variables (.env.local) | Zero code to manage, standard OTEL approach |
| **Console Format** | Default SDK output (verbose OTLP JSON) | No custom formatting code |
| **Sensitive Filtering** | SDK defaults only (Authorization header) | No custom filtering code, document gaps |
| **Performance** | Observe SDK defaults (~1-3% overhead) | No custom optimization code |

## Learning Outcomes (Study Goals)

1. **What OpenTelemetry provides by default** (without customization)
2. **Default output format** (OTLP JSON structure)
3. **What's NOT filtered** (sensitive data gaps)
4. **Auto-instrumentation coverage** (what gets traced automatically)
5. **Performance impact** (baseline overhead)

## Next Steps

**Phase 1**: Document default data model and output contract
- Describe default OTLP JSON structure
- Document what appears in console by default
- Create quickstart with minimal setup (env vars + 12-line file)
- No custom contracts needed (using OpenTelemetry standard format)

