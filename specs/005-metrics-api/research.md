# Research: API Metrics Correlated With Traces and Logs

**Feature**: API Metrics Correlated With Traces and Logs  
**Branch**: 005-metrics-api  
**Date**: April 15, 2026

## Overview

This document captures Phase 0 research decisions for console-first API metrics that are correlated with traces and logs and ready for future exporter wiring.

## Decision 1: Metric Emission Pattern

**Decision**: Emit one structured completion metric event per handled API request.

**Rationale**:
- Matches clarified scope for this phase.
- Keeps cardinality and output volume predictable.
- Ensures event includes final status and total duration.

**Alternatives Considered**:
- Emit start and completion events: rejected for unnecessary noise in this phase.
- Emit aggregate counters/histograms now: rejected by clarification; deferred to future phase.

## Decision 2: Correlation Strategy

**Decision**: Include `trace_id`, `span_id`, and `request_id` when available, and include `correlation_state` when context is partial/missing.

**Rationale**:
- Supports cross-signal joining between metric events, trace spans, and endpoint logs.
- Preserves troubleshooting capability even when context is unavailable.
- Aligns with explicit clarification answers.

**Alternatives Considered**:
- Trace-only correlation: rejected because request-level linking is weaker.
- Fail emission when context is missing: rejected because telemetry must degrade gracefully.

## Decision 3: Error Classification

**Decision**: Use `status_class` only (`1xx`, `2xx`, `3xx`, `4xx`, `5xx`) for error classification shape in this phase.

**Rationale**:
- Provides stable, low-cardinality classification.
- Keeps schema simple while still enabling filtering and dashboard grouping.

**Alternatives Considered**:
- Add `error_type` now: rejected to avoid premature taxonomy decisions.

## Decision 4: Schema Stability and Safety

**Decision**: Define canonical event keys and primitive value types; forbid sensitive payload fields by default.

**Rationale**:
- Stable key set prevents downstream transformation churn.
- Primitive types simplify parsing for future exporters.
- Avoids accidental disclosure in console output.

**Alternatives Considered**:
- Free-form message strings only: rejected due to poor machine readability.
- Endpoint-specific field sets: rejected due to drift risk.

## Decision 5: Environment Labeling

**Decision**: Default `environment` to `local` for local development runs unless explicitly overridden.

**Rationale**:
- Matches clarification.
- Distinguishes local study runs from deployed development/staging naming.

**Alternatives Considered**:
- Default to `development`: rejected by clarification.

## Decision 6: Route Scope and Normalization

**Decision**: Apply metric emission to all current API routes in scope and normalize dynamic routes to templates.

**In-Scope Routes**:
- `/api/health`
- `/api/albums`
- `/api/albums/[id]`
- `/api/photos/[id]`

**Rationale**:
- Consistent labels across requests reduce route-cardinality noise.
- Covers all active API surface in current app.

## Implementation Notes

- Reuse existing trace/log utility boundaries where possible.
- Keep metric emission non-blocking for endpoint success/failure paths.
- Ensure exactly one completion metric event is emitted for both success and error responses.

## Final Implementation Notes (Phase 6)

**Completion Date**: April 17, 2026

- Shared metric typing and emission behavior are now centralized and consistent across all in-scope API handlers.
- Correlation handling is finalized with explicit `present` and `missing` states:
	- route-handled requests emit trace and span identifiers with `correlation_state=present`;
	- no-context utility calls emit nullable identifiers with `correlation_state=missing`.
- Schema stability goals are satisfied for exporter-readiness:
	- canonical `event_name=api.request.metric.completed`;
	- `status_class` derived from `status_code` and aligned with `outcome`;
	- `error_message` emitted only on error outcomes;
	- dynamic route labels normalized to templates.
- Environment resolution is finalized for local development behavior with default `environment=local` unless explicitly overridden.
- Safety requirements are preserved by forbidden-field filtering during emission (`request_body`, `response_body`, `payload`, `authorization`, `cookie`).
- Manual verification logs in `quickstart.md` confirm end-to-end behavior for US1, US2, and US3 plus final phase sign-off checks.
