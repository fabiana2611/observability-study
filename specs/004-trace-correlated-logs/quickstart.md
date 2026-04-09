# Quickstart: Endpoint Logs Correlated With Traces

**Feature**: Endpoint Logs Correlated With Traces  
**Branch**: 004-trace-correlated-logs  
**Date**: April 7, 2026

## Goal

Run the app, call API endpoints, and verify that each endpoint emits a structured log event correlated with trace context.

## Prerequisites

- Node.js 20+
- Dependencies installed with `npm install`
- Active branch: `004-trace-correlated-logs`

## Run

1. Start development server:

```bash
npm run dev
```

2. Trigger endpoint requests (port from package scripts):

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/albums
curl http://localhost:3001/api/albums/1
curl http://localhost:3001/api/photos/1
```

## Verify Structured Endpoint Logs

For each request, confirm one endpoint log event is printed and includes:
- `event_name`
- `timestamp`
- `method`
- `route`
- `status_code`
- `outcome`
- `trace_id`
- `span_id`
- `correlation_state`

## Implementation Notes: Manual Validation Flow

Use this flow while implementing route-level logging to keep verification repeatable:

1. Run requests one at a time and correlate each response to exactly one `endpoint.request.completed` log event.
2. Validate fields in two passes:
   - Presence/shape: required fields exist and use canonical names from contract.
   - Outcome mapping: `level`, `outcome`, `status_code`, and `error_message` match success/failure behavior.
3. For dynamic routes, confirm logged `route` is normalized (`/api/albums/[id]`, `/api/photos/[id]`) instead of concrete ids.
4. If trace context is unavailable, confirm `correlation_state=missing` and nullable correlation identifiers.

Suggested terminal helpers:

```bash
# Filter only endpoint completion events
npm run dev 2>&1 | rg "endpoint.request.completed"

# View only error-level endpoint events during failure checks
npm run dev 2>&1 | rg '"level":"error"'
```

## Log Prefix Toggle

Endpoint log lines support an optional prefix format such as `[LOG INFO]` and `[LOG ERROR]`.

- Environment variable: `ENDPOINT_LOG_PREFIX_ENABLED`
- Default behavior (unset): prefix is enabled
- Disable prefix by setting one of: `0`, `false`, `no`, `off`

Examples:

```bash
# Default: emits with prefix
npm run dev

# Disable prefix for plain JSON log lines
ENDPOINT_LOG_PREFIX_ENABLED=false npm run dev
```

## Verify Error Case

Trigger an error (invalid id):

```bash
curl http://localhost:3001/api/albums/not-a-number
```

Confirm log event includes:
- `level=error`
- `outcome=error`
- non-2xx `status_code`
- `error_message`
- correlation fields (`trace_id`, `span_id` or `correlation_state=missing`)

## Manual Acceptance Checklist

- Every API request produces exactly one endpoint log event
- Successful and failed requests both include correlation fields
- Dynamic routes use normalized route patterns in logs
- Endpoint functionality still responds correctly while logging is enabled

## US2 Schema Consistency Checks

For schema/export readiness validation, check every emitted endpoint event against these rules:

- Required keys always present: `timestamp`, `level`, `event_name`, `service_name`, `environment`, `method`, `route`, `status_code`, `outcome`, `correlation_state`
- Optional keys shape: `trace_id` and `span_id` must be string or null, `duration_ms` must be a non-negative number when present, `error_message` present only for error outcomes
- Canonical values: `event_name=endpoint.request.completed`, `level` in `info|error`, `outcome` in `success|error`, `correlation_state` in `present|missing`
- Route normalization: dynamic handlers emit `/api/albums/[id]` and `/api/photos/[id]` (never concrete ids)
- Service/environment consistency: events use stable values (`service_name=observability-study`, `environment=development`) unless environment overrides are intentionally configured

## Verification Log Template

Record checks as implementation progresses:

- Route called:
- Response status:
- Event emitted once (yes/no):
- Correlation state (`present` or `missing`):
- Contract fields valid (yes/no):
- Notes:

## US1 Manual Verification Results (2026-04-09)

Verification run summary:

- Dev server started with `npm run dev` (project root: `observability-study`)
- Requests executed for `/api/health`, `/api/albums`, `/api/albums/1`, `/api/photos/1`, and `/api/albums/not-a-number`
- HTTP statuses observed: 200, 200, 200, 200, 400
- Endpoint completion events observed in logs: 5 (`event_name=endpoint.request.completed`)
- Correlation identifiers present in all observed events (`correlation_state=present`)

Recorded outcomes:

- Route called: `/api/health`
- Response status: 200
- Event emitted once (yes/no): yes
- Correlation state (`present` or `missing`): present
- Contract fields valid (yes/no): yes
- Notes: Success event includes method, route, status, trace_id, and span_id.

- Route called: `/api/albums`
- Response status: 200
- Event emitted once (yes/no): yes
- Correlation state (`present` or `missing`): present
- Contract fields valid (yes/no): yes
- Notes: Success event includes `duration_ms` and canonical field names.

- Route called: `/api/albums/[id]` with `id=1`
- Response status: 200
- Event emitted once (yes/no): yes
- Correlation state (`present` or `missing`): present
- Contract fields valid (yes/no): yes
- Notes: Dynamic route pattern normalized in logged `route`.

- Route called: `/api/photos/[id]` with `id=1`
- Response status: 200
- Event emitted once (yes/no): yes
- Correlation state (`present` or `missing`): present
- Contract fields valid (yes/no): yes
- Notes: Dynamic route pattern normalized in logged `route`.

- Route called: `/api/albums/[id]` with invalid id (`not-a-number`)
- Response status: 400
- Event emitted once (yes/no): yes
- Correlation state (`present` or `missing`): present
- Contract fields valid (yes/no): yes
- Notes: Error event includes `level=error`, `outcome=error`, and `error_message=Invalid album ID`.

## US2 Manual Schema Consistency Results (2026-04-09)

Verification run summary:

- Requests executed for `/api/health`, `/api/albums`, `/api/albums/1`, `/api/photos/1`, and `/api/albums/not-a-number`
- HTTP statuses observed: 200, 200, 200, 200, 400
- Endpoint completion events parsed from logs: 5

Schema check output:

```json
{
   "eventCount": 5,
   "missingRequired": 0,
   "unexpectedKeys": 0,
   "badEnums": 0,
   "badTypes": 0,
   "badRoutePattern": 0,
   "badServiceEnv": 0,
   "errorMessageRuleViolations": 0
}
```

Recorded checks:

- Required field presence: pass (`missingRequired=0`)
- Canonical key set only: pass (`unexpectedKeys=0`)
- Enum/domain values: pass (`badEnums=0`)
- Type/range validation: pass (`badTypes=0`)
- Dynamic route normalization: pass (`badRoutePattern=0`)
- Consistent service/environment values: pass (`badServiceEnv=0`)
- `error_message` outcome rule: pass (`errorMessageRuleViolations=0`)

## US3 Manual Failure-Path Results (2026-04-09)

Verification run summary:

- Failure-focused requests executed:
   - `/api/albums/not-a-number` -> 400
   - `/api/albums/999999` -> 404
   - `/api/photos/not-a-number` -> 400
   - `/api/photos/999999` -> 404
- Context requests executed:
   - `/api/health` -> 200
   - `/api/albums` -> 200
- Endpoint completion events parsed from logs: 12 total
- Error events parsed (`outcome=error`): 8

Failure-path check output:

```json
{
   "eventCount": 12,
   "errorEventCount": 8,
   "errorEventsMissingErrorMessage": 0,
   "errorEventsWithNonErrorLevel": 0,
   "errorEventsWithStatusBelow400": 0,
   "errorEventsMissingCorrelationState": 0,
   "errorEventsMissingCorrelationIdentifiersAndMarker": 0,
   "albumFailureEvents": 4,
   "photoFailureEvents": 4
}
```

Recorded checks:

- Album detail failures include `error_message` and `outcome=error`: pass
- Photo detail failures include `error_message` and `outcome=error`: pass
- Error events always have `level=error` and `status_code>=400`: pass
- Correlation behavior on failures: pass (`correlation_state` present and valid; missing-context marker rule validated as zero violations)
- Albums list and health explicit failure branches: confirmed by handler-path inspection to set `errorMessage` before emission and emit non-success outcomes when status is non-2xx

## Final Quickstart Sign-Off (Phase 6, 2026-04-09)

Full quickstart walkthrough executed end-to-end:

- `npm run dev` started successfully
- Requests executed:
   - `/api/health` -> 200
   - `/api/albums` -> 200
   - `/api/albums/1` -> 200
   - `/api/photos/1` -> 200
   - `/api/albums/not-a-number` -> 400
   - `/api/photos/not-a-number` -> 400
- Endpoint completion events observed: 6
- Error events observed (`outcome=error`): 2
- Required field check: pass (`missingRequiredFields=0`)
- Correlation marker check: pass (`badCorrelationState=0`)
- Route coverage in emitted events:
   - `/api/health`: 1
   - `/api/albums`: 1
   - `/api/albums/[id]`: 2
   - `/api/photos/[id]`: 2

Cross-cutting final checks:

- Lint script executed via `npm run lint` with no reported lint errors for modified files.
- Endpoint behavior remained stable while logging was enabled.

Sign-off status: APPROVED
