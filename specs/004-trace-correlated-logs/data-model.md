# Data Model: Endpoint Logs Correlated With Traces

**Feature**: Endpoint Logs Correlated With Traces  
**Branch**: 004-trace-correlated-logs  
**Date**: April 7, 2026

## Overview

This model defines the structured event shape for endpoint logs. It is a telemetry contract for runtime events, not a persistence schema.

## Entities

### EndpointLogEvent

Represents one emitted log record for one endpoint request.

**Fields**:
- `timestamp`: ISO 8601 timestamp for event emission
- `level`: Log level (`info` for success, `error` for failures)
- `event_name`: Canonical event name (`endpoint.request.completed`)
- `service_name`: Service identifier
- `environment`: Deployment environment
- `method`: HTTP method
- `route`: Normalized route pattern
- `status_code`: HTTP response status code
- `outcome`: `success` or `error`
- `trace_id`: Trace identifier when available
- `span_id`: Span identifier when available
- `correlation_state`: `present` or `missing`
- `duration_ms`: Request duration in milliseconds
- `error_message`: Error summary (present only on error)

**Validation Rules**:
- Exactly one event per handled request
- `status_code` must be in 100-599
- `outcome` must map to status code class or exception path
- `trace_id` and `span_id` may be null only when `correlation_state=missing`
- `route` uses normalized route template for dynamic endpoints

## Supporting Entity

### TraceCorrelationContext

Represents correlation data extracted from active span context.

**Fields**:
- `trace_id`
- `span_id`
- `correlation_state`

**Rules**:
- If trace context extraction succeeds, `correlation_state=present` and IDs are non-null
- If extraction fails, `correlation_state=missing` and IDs are null

## Relationships

- One `EndpointLogEvent` references zero or one `TraceCorrelationContext`
- One trace may relate to multiple endpoint and internal events, but this feature only emits one endpoint event per request

## State Notes

Endpoint log lifecycle:
1. Request starts and span is active
2. Endpoint computes final status/outcome
3. Correlation context is read
4. Structured event is emitted to console
