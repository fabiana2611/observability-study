# Quickstart: API Metrics Correlated With Traces and Logs

**Feature**: API Metrics Correlated With Traces and Logs  
**Branch**: 005-metrics-api  
**Date**: April 15, 2026

## Goal

Run the app, call API routes, and verify one structured completion metric event is emitted per request with trace/log correlation fields.

## Prerequisites

- Node.js 20+
- Dependencies installed with `npm install`
- Active branch: `005-metrics-api`

## Run

1. Start development server:

```bash
npm run dev
```

2. Trigger in-scope API requests:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/albums
curl http://localhost:3001/api/albums/1
curl http://localhost:3001/api/photos/1
```

3. Trigger failure-path checks:

```bash
curl http://localhost:3001/api/albums/not-a-number
curl http://localhost:3001/api/photos/not-a-number
```

## Verify Metric Events

For each request, confirm exactly one `api.request.metric.completed` event is emitted and includes:

- `timestamp`
- `event_name`
- `service_name`
- `environment`
- `method`
- `route`
- `status_code`
- `status_class`
- `outcome`
- `duration_ms`
- `correlation_state`
- correlation identifiers (`trace_id`, `span_id`, `request_id`) when available

## Implementation Validation Notes

Use this route map while wiring handlers and validating emitted events:

| Request URL | Expected metric route | Expected success status | Failure probe |
| --- | --- | --- | --- |
| `/api/health` | `/api/health` | `200` | n/a |
| `/api/albums` | `/api/albums` | `200` | n/a |
| `/api/albums/1` | `/api/albums/[id]` | `200` | `/api/albums/not-a-number` -> `400` |
| `/api/photos/1` | `/api/photos/[id]` | `200` | `/api/photos/not-a-number` -> `400` |

Implementation checks to run for each route update:

1. Confirm `event_name` is exactly `api.request.metric.completed`.
2. Confirm `duration_ms` is numeric and non-negative.
3. Confirm `status_class` matches `status_code` family (`1xx` to `5xx`).
4. Confirm forbidden keys are absent (`request_body`, `response_body`, `payload`, `authorization`, `cookie`).
5. Confirm correlation behavior:
   - emit identifiers when available;
   - otherwise emit `correlation_state=missing` with nullable identifiers.

## Manual Validation Flow

1. Call one route at a time and confirm one completion metric event per response.
2. Confirm route normalization for dynamic handlers:
   - `/api/albums/[id]`
   - `/api/photos/[id]`
3. Confirm classification rules:
   - `status_code=2xx` -> `status_class=2xx`, `outcome=success`
   - `status_code=4xx or 5xx` -> `status_class=4xx/5xx`, `outcome=error`
4. Confirm missing-correlation behavior:
   - If identifiers are missing, event still emits with `correlation_state=missing`.
5. Confirm safety behavior:
   - No payload/body fields in emitted events.
   - Endpoint response behavior is unchanged if emission fails.
6. Confirm environment default behavior:
   - When no explicit override is set, emitted events use `environment=local`.
7. Confirm schema consistency behavior:
   - Required keys remain present for all tested events.
   - Optional keys (`trace_id`, `span_id`, `request_id`, `error_message`) follow contract rules.

## Suggested Terminal Filters

```bash
# Show only metric completion events
npm run dev 2>&1 | rg "api.request.metric.completed"

# Show only error outcome metric events
npm run dev 2>&1 | rg '"outcome":"error"'
```

## Acceptance Checklist

- Every tested API request emits exactly one metric completion event.
- Events include required core fields and stable key names.
- `status_class` values correctly match status codes.
- Correlation fields are present when available and explicit when missing.
- Dynamic routes are normalized.
- No request failures are introduced by metric emission.
- `environment` defaults to `local` unless intentionally overridden.
- Required/optional keys remain contract-compliant across success and failure events.

## Verification Log Template

- Route called:
- Response status:
- Event emitted once (yes/no):
- Route normalized (yes/no):
- Status class correct (yes/no):
- Correlation state (`present` or `missing`):
- Core fields valid (yes/no):
- Environment default valid (yes/no):
- Notes:

## US1 Verification Results

**Run Date**: April 16, 2026

Historical baseline snapshot:

- Completed the six-route request matrix (`/api/health`, `/api/albums`, `/api/albums/1`, `/api/photos/1`, and both invalid-id probes).
- Verified one completion metric event per request with core request fields, status classification, and dynamic route normalization.
- Recorded baseline gaps to be resolved in later phases:
   - correlation emitted as `missing` for route requests;
   - environment emitted as `development` under `next dev`;
   - success events still carrying `error_message: null`.

## US2 Verification Results

**Run Date**: April 16, 2026

Correlation milestone snapshot:

- Re-ran the six-route request matrix and a direct utility fallback call.
- Verified route metrics emitted `trace_id` and `span_id` with `correlation_state=present`.
- Verified no-context fallback emitted nullable identifiers with `correlation_state=missing`.
- Remaining gap after US2: environment still emitted as `development` in local dev at that time.

## US3 Verification Results

**Run Date**: April 17, 2026  
**Command Set**:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/albums
curl http://localhost:3001/api/albums/1
curl http://localhost:3001/api/photos/1
curl http://localhost:3001/api/albums/not-a-number
curl http://localhost:3001/api/photos/not-a-number
npx tsx -e "import { emitApiMetricEvent } from './app/lib/tracing'; emitApiMetricEvent({ method: 'GET', route: '/api/us3-fallback', status_code: 200, duration_ms: 1.5 });"
```

### Schema Consistency Results

| Check | Observed result | Outcome |
| --- | --- | --- |
| Stable event key set | Events emitted canonical keys (`timestamp`, `event_name`, `service_name`, `environment`, `method`, `route`, `status_code`, `status_class`, `outcome`, `duration_ms`, `correlation_state`) with optional correlation fields | pass |
| event_name enforcement | All captured events used `event_name=api.request.metric.completed` | pass |
| status_class derivation | `status_code=200` produced `status_class=2xx`; `status_code=400` produced `status_class=4xx` | pass |
| outcome consistency | Success routes emitted `outcome=success`; 400 routes emitted `outcome=error` | pass |
| error_message optionality | Success events omitted `error_message`; error events included sanitized error messages | pass |
| environment defaulting | Route events emitted `environment=local` after resolver updates; direct fallback utility call also emitted `environment=local` | pass |
| correlation fields in present state | Route events emitted `correlation_state=present` with trace and span IDs | pass |
| correlation fields in missing state | Direct no-context call emitted `correlation_state=missing` with `trace_id`, `span_id`, `request_id` as `null` | pass |
| route normalization | Dynamic route events used `/api/albums/[id]` and `/api/photos/[id]` template labels | pass |
| forbidden field safety | No forbidden keys (`request_body`, `response_body`, `payload`, `authorization`, `cookie`) observed in emitted metric payloads | pass |

### Summary

- Pass: metric schema keys, value types, and enum domains are stable across success and error paths.
- Pass: route template normalization remains consistent for dynamic endpoints.
- Pass: fallback and present-correlation states behave according to contract expectations.
- Pass: environment defaults to `local` when no explicit deployment override is set.

## Phase 6 Final Walkthrough and Sign-Off

**Run Date**: April 17, 2026

### Lint Check (T034)

```bash
npm run lint
```

- Result: pass (no eslint violations reported by the project lint script).

### Complete Quickstart Walkthrough (T035)

Route execution command set:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/albums
curl http://localhost:3001/api/albums/1
curl http://localhost:3001/api/photos/1
curl http://localhost:3001/api/albums/not-a-number
curl http://localhost:3001/api/photos/not-a-number
```

Observed status matrix:

- `health:200`
- `albums:200`
- `album1:200`
- `photo1:200`
- `album_bad:400`
- `photo_bad:400`

Observed metric evidence from walkthrough logs:

- Completion events captured: 7 total lines containing `api.request.metric.completed`.
- Interpretation: 6 lines correspond to the explicit quickstart API calls; 1 additional `/api/albums` event was emitted during startup traffic.
- All captured events used `event_name=api.request.metric.completed`.
- Success/error classification stayed consistent (`200 -> 2xx/success`, `400 -> 4xx/error`).
- Dynamic routes remained normalized (`/api/albums/[id]`, `/api/photos/[id]`).
- Captured route events emitted `environment=local` and `correlation_state=present` with trace/span identifiers.

Fallback no-context command:

```bash
npx tsx -e "import { emitApiMetricEvent } from './app/lib/tracing'; emitApiMetricEvent({ method: 'GET', route: '/api/phase6-fallback', status_code: 200, duration_ms: 1.75 });"
```

Observed fallback output (representative):

- `correlation_state=missing`
- `trace_id=null`
- `span_id=null`
- `request_id=null`
- `environment=local`

### Final Sign-Off

- Pass: FR-001 through FR-015 are covered by implementation and manual verification logs.
- Pass: schema and correlation behavior are stable and exporter-ready for future Jaeger/Prometheus/Grafana wiring.
- Pass: no endpoint failures were introduced by metric emission behavior during walkthrough.
