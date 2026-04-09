# Research: Endpoint Logs Correlated With Traces

**Feature**: Endpoint Logs Correlated With Traces  
**Branch**: 004-trace-correlated-logs  
**Date**: April 7, 2026

## Overview

This document captures Phase 0 research decisions for adding endpoint logs correlated with tracing context while keeping console output as the initial destination.

## Decision 1: Endpoint Log Emission Pattern

**Decision**: Emit one structured log event per endpoint request at response completion (or failure catch path).

**Rationale**:
- One-event-per-request keeps log volume predictable and easy to inspect.
- Event-at-completion guarantees final status code and outcome are captured.
- The pattern aligns with existing span lifecycle usage in route handlers.

**Alternatives Considered**:
- Emit multiple logs per request stage: rejected for unnecessary complexity and noisy output.
- Middleware-only logs: rejected because current instrumentation is route-local and correlation is easiest where span context is available.

## Decision 2: Correlation Fields

**Decision**: Include `trace_id` and `span_id` in each endpoint log, plus `correlation_state` when context is missing.

**Rationale**:
- `trace_id` and `span_id` are sufficient to map logs to traces.
- Missing-context marker keeps logs usable when context extraction fails.
- Stable keys simplify future forwarding to observability tooling.

**Alternatives Considered**:
- Include only trace ID: rejected because span-level troubleshooting becomes harder.
- Fail log emission when IDs are absent: rejected because observability should degrade gracefully.

## Decision 3: Schema Stability for Future Export

**Decision**: Define a stable JSON event shape with normalized field names and primitive value types.

**Rationale**:
- A stable schema reduces later rework when integrating external pipelines.
- Consistent naming supports simple filtering and transformation rules.
- Primitive-only values reduce parsing ambiguity.

**Alternatives Considered**:
- Free-form log messages only: rejected because they are hard to parse and correlate.
- Endpoint-specific custom schemas: rejected because cross-endpoint consistency is a requirement.

## Decision 4: Error Logging Behavior

**Decision**: Emit error endpoint logs with `outcome=error`, `status_code`, and `error_message` (without payload dumps).

**Rationale**:
- Captures failure context while avoiding sensitive or excessive data.
- Aligns with spec requirement for troubleshooting-ready error logs.
- Keeps logs concise and forward-compatible.

**Alternatives Considered**:
- Include full request/response bodies: rejected due to sensitivity and verbosity risk.
- Omit error details entirely: rejected because it reduces debugging value.

## Decision 5: Dependencies and Implementation Scope

**Decision**: Use only existing dependencies and current OpenTelemetry integration points.

**Rationale**:
- Constitution requires minimal dependencies.
- Existing tracing setup already exposes needed context.
- No external exporter integration in this phase.

**Alternatives Considered**:
- Add new logging libraries: rejected as unnecessary for current scope.
- Implement external shipping now: rejected because current scope is console-first, export-ready schema.

## Phase 6 Implementation Notes (Final)

### Implemented Outcome Summary

- Shared endpoint logging utility implemented in `app/lib/tracing.ts` with canonical event emission.
- Correlation extraction supports active context fallback and explicit missing marker behavior.
- Route integrations completed for all API handlers:
	- `/api/albums`
	- `/api/albums/[id]`
	- `/api/photos/[id]`
	- `/api/health`
- Duration measurement is emitted consistently as `duration_ms` across all handlers.

### Finalized Schema Behavior

- Required fields are always emitted for endpoint completion events.
- Optional field behavior:
	- `trace_id` and `span_id` are string or null.
	- `duration_ms` is emitted as non-negative number when available.
	- `error_message` is emitted for failure outcomes and omitted for successful outcomes.
- Dynamic routes are emitted as normalized patterns, not concrete ids.
- `service_name` and `environment` use centralized resolver rules for consistency.

### Verification Notes

- US1 verification confirmed one endpoint event per request and route-level correlation.
- US2 verification confirmed canonical key set, type stability, and schema consistency.
- US3 verification confirmed failure-path completeness (`outcome=error`, status, error message, and correlation behavior).
- Lint script completed after implementation changes with no reported lint errors in modified files.
