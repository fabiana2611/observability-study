# Quickstart: OpenTelemetry Zero-Code Study

**Goal**: Observe default OpenTelemetry behavior with minimal code  
**Time**: ~5 minutes

## What You'll Get

✅ Automatic tracing (API routes, Server Components, database queries)  
✅ Default OpenTelemetry console output (verbose OTLP JSON)  
✅ 1 file (~12 lines) + environment variables  
❌ No custom formatting, filtering, or processors

**Study Purpose**: Learn what OpenTelemetry provides by default without customization.

---

## Setup

### 1. Install Packages (2 only)

```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

### 2. Create `instrumentation.ts` (project root)

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

### 3. Configure `.env.local` (project root)

```bash
OTEL_SDK_DISABLED=false
OTEL_SERVICE_NAME=observability-study
OTEL_TRACES_EXPORTER=console
OTEL_TRACES_SAMPLER=always_on
OTEL_RESOURCE_ATTRIBUTES=service.version=0.1.0,deployment.environment=development
```

### 4. Enable in `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};
```

### 5. Run

```bash
npm run dev
```

Then visit `http://localhost:3000/album/1`

---

## What You'll See

**Default OTLP JSON Format** (verbose but complete):

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
  "resource": {
    "attributes": {
      "service.name": "observability-study",
      "telemetry.sdk.name": "opentelemetry"
    }
  }
}
```

**Key Notes**:
- `kind`: Integer (1=SERVER, 2=CLIENT, 3=INTERNAL)
- `timestamp`/`duration`: Microseconds (not milliseconds)
- `status.code`: 0=OK, 2=ERROR
- Output includes full resource metadata on every span

---

## Filter Output (Optional)

```bash
# Pretty-print with jq
npm run dev 2>&1 | grep '^{' | jq .

# Find slow operations (>100ms = 100000μs)
npm run dev 2>&1 | grep '^{' | jq 'select(.duration > 100000)'

# Extract trace IDs
npm run dev 2>&1 | grep '^{' | jq -r '.traceId' | sort | uniq
```

---

## Study Observations

1. **Default Format**: OTLP JSON (not human-optimized)
2. **Auto-Instrumentation**: HTTP, fetch, SQLite captured automatically
3. **Default Filtering**: Only `Authorization` header excluded
4. **Verbosity**: Full metadata on every span (resource, instrumentation scope)
5. **Performance**: ~1-3% overhead with defaults

---

## Known Limitations & Edge Cases

### Console Buffer Limitations
- **Issue**: After hours of operation with 100% capture, console buffer may fill
- **Impact**: Terminal may truncate old output
- **Mitigation**: For long sessions, redirect output to file: `npm run dev > telemetry.log 2>&1`
- **Alternative**: Set `OTEL_SDK_DISABLED=true` when not actively debugging

### High-Frequency Operations
- **Issue**: API routes with thousands of requests/second generate massive output
- **Impact**: Console becomes difficult to read, performance overhead increases
- **Study Note**: Observe default behavior; production would use sampling
- **Temporary Fix**: Reduce traffic or enable sampling via `OTEL_TRACES_SAMPLER=parentbased_traceidratio` with `OTEL_TRACES_SAMPLER_ARG=0.1` (10%)

### Sensitive Data Exposure
- **Issue**: Emails, tokens, cookies, user IDs appear in output (except Authorization header)
- **Impact**: Security risk if logs are shared or stored
- **Study Note**: This demonstrates why production needs custom filtering
- **Mitigation**: Don't commit `.env.local` with real credentials; use test data only

### Environment Compatibility
- **Supported**: Node.js runtime only (Next.js server-side)
- **Not Supported**: Edge runtime, serverless (Vercel Edge Functions)
- **Reason**: `instrumentation.ts` hook requires full Node.js environment
- **Check**: File includes `if (process.env.NEXT_RUNTIME === 'nodejs')` guard

### Concurrent Server Component Renders
- **Behavior**: Each concurrent request gets unique traceId automatically
- **Impact**: Multiple users requesting same page won't interfere
- **Observation**: Search console output by traceId to follow specific request

### Performance Budget Exceeded
- **Issue**: What if telemetry overhead exceeds 5% budget?
- **Study Note**: Default SDK typically adds 1-3% overhead
- **If Exceeded**: Document finding; production would optimize or reduce capture rate
- **Measurement**: Compare response times with `OTEL_SDK_DISABLED=true` vs `false`

---

## Troubleshooting

- No output? Check `experimental.instrumentationHook: true` in `next.config.ts`
- Restart server after creating `instrumentation.ts`
- File must be in project root (not in `app/`)
- Empty output? Verify `OTEL_SDK_DISABLED=false` in `.env.local`
- Wrong service name? Update `OTEL_SERVICE_NAME` environment variable

---

## Summary

**Code**: 1 file (12 lines)  
**Config**: Environment variables only  
**Customization**: None (pure SDK defaults)  
**Study Value**: Learn OpenTelemetry out-of-the-box behavior
