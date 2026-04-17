# Data Model: API Metrics Correlated With Traces and Logs

**Feature**: API Metrics Correlated With Traces and Logs  
**Branch**: 005-metrics-api  
**Date**: April 15, 2026

## Overview

This model defines the structured metric event contract emitted once per handled API request. It is a telemetry event model, not a persistence schema.

## Entities

### ApiMetricEvent

Represents one completion metric event for one API request.

**Fields**:
- `timestamp`: Event emission timestamp in machine-readable format.
- `event_name`: Canonical metric event discriminator (`api.request.metric.completed`).
- `service_name`: Logical service identifier.
- `environment`: Runtime environment label (`local` by default unless overridden).
- `method`: HTTP request method.
- `route`: Normalized route pattern.
- `status_code`: Final HTTP response status code.
- `status_class`: HTTP status group label (`1xx`, `2xx`, `3xx`, `4xx`, `5xx`).
- `outcome`: Request result (`success` or `error`).
- `duration_ms`: Total endpoint handling duration in milliseconds.
- `trace_id`: Trace identifier when available.
- `span_id`: Span identifier when available.
- `request_id`: Request identifier when available.
- `correlation_state`: Correlation availability marker (`present` or `missing`).

**Optional Error Field**:
- `error_message`: Sanitized summary for failure outcomes only.

**Validation Rules**:
- Exactly one `ApiMetricEvent` per handled request.
- `status_code` must be in range 100-599.
- `status_class` must match `status_code` class.
- `duration_ms` must be non-negative.
- If `correlation_state=present`, at least one correlation identifier is expected.
- If correlation identifiers are unavailable, `correlation_state=missing` is required.
- Dynamic routes must use normalized templates (for example `/api/albums/[id]`).

### CorrelationContext

Represents the set of identifiers used to connect metric events to traces and logs.

**Fields**:
- `trace_id`
- `span_id`
- `request_id`
- `correlation_state`

**Rules**:
- Any identifier may be null when unavailable.
- `correlation_state` reflects whether correlation data was available at emission time.

### MetricSchemaProfile

Defines canonical field names, required keys, optional keys, and forbidden keys for event stability.

**Required Keys**:
- `timestamp`, `event_name`, `service_name`, `environment`, `method`, `route`, `status_code`, `status_class`, `outcome`, `duration_ms`, `correlation_state`

**Optional Keys**:
- `trace_id`, `span_id`, `request_id`, `error_message`

**Forbidden Keys**:
- `request_body`, `response_body`, `payload`, `authorization`, `cookie`

## Relationships

- One `ApiMetricEvent` includes one `CorrelationContext` snapshot.
- One `MetricSchemaProfile` governs all emitted `ApiMetricEvent` records.
- Many metric events may reference the same trace over time, but each event maps to one handled request.

## Lifecycle

1. Request handling starts.
2. Endpoint executes business logic.
3. Final status and elapsed time are computed.
4. Correlation context is extracted.
5. Completion event is emitted to console.
6. Request response flow is preserved even if emission fails.
